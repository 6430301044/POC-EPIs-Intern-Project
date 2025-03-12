import express from "express";
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import dotenv from "dotenv";
import multer from 'multer';
import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";

dotenv.config();

const router = express.Router();

// ตั้งค่า Azure Blob Storage
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME || "";
const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY || "";
const AZURE_CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME || "uploads";

console.log("Azure Storage Account Name:", process.env.AZURE_STORAGE_ACCOUNT_NAME);
console.log("Azure Storage Account Key:", process.env.AZURE_STORAGE_ACCOUNT_KEY);
console.log("Azure Container Name:", process.env.AZURE_CONTAINER_NAME);

// สร้าง Blob Service Client
const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY)
);

// ดึง Client ของ Container
const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);

// ตรวจสอบว่าคอนเทนเนอร์มีอยู่หรือไม่ ถ้าไม่มีให้สร้างใหม่
async function ensureContainerExists() {
  const exists = await containerClient.exists();
  if (!exists) {
    await containerClient.create();
    console.log(`✅ Created container: ${AZURE_CONTAINER_NAME}`);
  }
}

// ใช้ Multer สำหรับอัปโหลดไฟล์
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    console.log('Uploaded file:', file); // ตรวจสอบว่าไฟล์อะไรที่อัปโหลด
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      return cb(new Error('Only JPEG and PNG files are allowed'), false);
    }
    cb(null, true); // อนุญาตให้ไฟล์ผ่าน
  }
});


// สร้าง interface ที่ขยาย Request และเพิ่ม property file
interface MulterRequest extends Request {
  file: Express.Multer.File;
}

// API สำหรับอัปโหลดไฟล์
router.post("/", upload.single("file"), async (req: MulterRequest, res: Response) => {
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

    return res.status(200).json({
      message: "File uploaded successfully",
      blobName,
      url: `${containerClient.url}/${blobName}`,
    });

  } catch (error) {
    console.error("Error in file upload:", error);
    return res.status(500).json({ message: "Error uploading file", error: error.message });
  }
});

// API สำหรับดึงรายการไฟล์ทั้งหมด
router.get("/files", async (req: Request, res: Response) => {
  try {
    const blobs = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      blobs.push({ name: blob.name, url: `${containerClient.url}/${blob.name}` });
    }
    return res.status(200).json(blobs);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching files", error: (error as Error).message });
  }
});

export default router;