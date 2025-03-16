import { Request, Response } from "express";
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { connectToDB } from "../../db/dbConfig";
import sql from "mssql";

// ตั้งค่า Azure Blob Storage
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME || "";
const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY || "";
const AZURE_CONTAINER_PROFILE = process.env.AZURE_CONTAINER_PROFILE || "profile";

// สร้าง Blob Service Client
const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY)
);

// ดึง Client ของ Container
const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_PROFILE);

// ตรวจสอบว่าคอนเทนเนอร์มีอยู่หรือไม่ ถ้าไม่มีให้สร้างใหม่
async function ensureContainerExists() {
  const exists = await containerClient.exists();
  if (!exists) {
    await containerClient.create();
    console.log(`✅ Created container: ${AZURE_CONTAINER_PROFILE}`);
  }
}

// สร้าง interface ที่ขยาย Request และเพิ่ม property file
interface MulterRequest extends Request {
  file: Express.Multer.File;
}

// ฟังก์ชันลบไฟล์จาก Azure Blob Storage
async function deleteOldProfileImage(imageUrl: string) {
  try {
    // ไม่ลบรูปภาพ default
    if (!imageUrl || imageUrl.includes('defaultProfileImage.jpg')) {
      return;
    }

    // แยก blobName จาก URL
    const urlParts = imageUrl.split('/');
    const blobName = urlParts[urlParts.length - 1];

    // ตรวจสอบว่า blob มีอยู่จริงหรือไม่
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const exists = await blockBlobClient.exists();

    if (exists) {
      // ลบ blob
      await blockBlobClient.delete();
      console.log(`✅ Deleted old profile image: ${blobName}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting old profile image:`, error);
    // ไม่ throw error เพื่อให้กระบวนการอัปโหลดดำเนินต่อไปได้
  }
}

// ฟังก์ชันอัปโหลดไฟล์
export const uploadUserImage = async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    await ensureContainerExists(); // ตรวจสอบและสร้างคอนเทนเนอร์ถ้ายังไม่มี

    const fileExtension = req.file.originalname.split(".").pop(); // ดึงนามสกุลไฟล์
    const blobName = `${uuidv4()}.${fileExtension}`; // ใช้ UUID ป้องกันไฟล์ซ้ำ
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // อัปโหลดไฟล์และตั้งค่า Content-Type ให้ตรงกับไฟล์ที่อัปโหลด
    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    // สร้าง URL สำหรับเข้าถึงไฟล์
    const User_image = `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${AZURE_CONTAINER_PROFILE}/${blobName}`;

    // ถ้ามี User_id ให้บันทึกลงฐานข้อมูล
    if (req.body.User_id) {
      try {
        const pool = await connectToDB();
        
        // ตรวจสอบว่ามีข้อมูลรูปภาพของผู้ใช้อยู่แล้วหรือไม่
        const checkResult = await pool.request()
          .input("User_id", sql.Int, req.body.User_id)
          .query("SELECT User_image FROM dbo.Users WHERE User_id = @User_id");
        
        if (checkResult.recordset.length > 0) {
          // ลบรูปภาพเก่าจาก Azure Blob Storage (ถ้ามี)
          const oldImageUrl = checkResult.recordset[0].User_image;
          if (oldImageUrl) {
            await deleteOldProfileImage(oldImageUrl);
          }
          
          // อัปเดตข้อมูลรูปภาพที่มีอยู่
          await pool.request()
            .input("User_id", sql.Int, req.body.User_id)
            .input("User_image", sql.NVarChar, User_image)
            .query("UPDATE dbo.Users SET User_image = @User_image WHERE User_id = @User_id");
        } else {
          // เพิ่มข้อมูลรูปภาพใหม่
          await pool.request()
            .input("User_id", sql.Int, req.body.User_id)
            .input("User_image", sql.NVarChar, User_image)
            .query("UPDATE dbo.Users SET User_image = @User_image WHERE User_id = @User_id");
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        // ไม่ต้องส่งข้อผิดพลาดกลับไปที่ผู้ใช้ เพราะการอัปโหลดไฟล์สำเร็จแล้ว
      }
    }

    // ส่งข้อมูลกลับไปยังผู้ใช้
    res.status(200).json({
      message: "File uploaded successfully",
      User_image: User_image,
      fileName: blobName
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading file", error: error.message });
  }
};

// ฟังก์ชันดึงรูปภาพของผู้ใช้
export const getUserImage = async (req: Request, res: Response) => {
  try {
    const { User_id } = req.params;
    
    if (!User_id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    // แปลง Userid เป็นตัวเลขและตรวจสอบความถูกต้อง
    const Userid = parseInt(User_id);
    if (isNaN(Userid)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const pool = await connectToDB();
    
    const result = await pool.request()
      .input("User_id", sql.Int, User_id) // ส่งค่าที่แปลงเป็นตัวเลขแล้ว
      .query("SELECT User_image FROM dbo.Users WHERE User_id = @User_id");
    
    if (result.recordset.length === 0) {
      // ไม่พบรูปภาพ ส่งค่า default
      return res.status(200).json({
        success: true,
        User_image: null, // ให้ frontend ใช้รูป default
        isDefault: true
      });
    }
    
    res.status(200).json({
      success: true,
      User_image: result.recordset[0].User_image,
      isDefault: false
    });
  } catch (error) {
    console.error("Error fetching user image:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};