import { Request, Response } from "express";
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { connectToDB } from "../../db/dbConfig";
import sql from "mssql";

// ตั้งค่า Azure Blob Storage
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME || "";
const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY || "";
const AZURE_CONTAINER_NEWS = process.env.AZURE_CONTAINER_NEWS || "newsimage";

// สร้าง Blob Service Client
const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY)
);

// ดึง Client ของ Container
const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NEWS);

// ตรวจสอบว่าคอนเทนเนอร์มีอยู่หรือไม่ ถ้าไม่มีให้สร้างใหม่
async function ensureContainerExists() {
  const exists = await containerClient.exists();
  if (!exists) {
    await containerClient.create();
    console.log(`✅ Created container: ${AZURE_CONTAINER_NEWS}`);
  }
}

// สร้าง interface ที่ขยาย Request และเพิ่ม property files
interface MulterRequest extends Request {
  files: Express.Multer.File[];
}

// ฟังก์ชันอัปโหลดข่าวพร้อมรูปภาพ
export const uploadNews = async (req: MulterRequest, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { title, content, category, Create_by } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await ensureContainerExists(); // ตรวจสอบและสร้างคอนเทนเนอร์ถ้ายังไม่มี

    // เชื่อมต่อฐานข้อมูล
    const pool = await connectToDB();

    // 1️⃣ เพิ่มข้อมูลข่าวเข้า News
    const result = await pool.request()
      .input('News_category', sql.NVarChar, category)
      .input('News_title', sql.NVarChar, title)
      .input('News_content', sql.NVarChar, content)
      .input('Create_by', sql.Int, Create_by)
      .query(`
        INSERT INTO News (News_category, News_title, News_content, Create_by)
        VALUES (@News_category, @News_title, @News_content, @Create_by);
        SELECT SCOPE_IDENTITY() AS news_id;
      `);

    const newsId = result.recordset[0].news_id; // ดึง id ของข่าวที่เพิ่งเพิ่ม

    // 2️⃣ อัปโหลดรูปภาพไปยัง Azure Blob Storage
    const uploadedFiles = [];
    for (const file of req.files) {
      const fileExtension = file.originalname.split(".").pop(); // ดึงนามสกุลไฟล์
      const blobName = `${uuidv4()}.${fileExtension}`; // ใช้ UUID ป้องกันไฟล์ซ้ำ
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // อัปโหลดไฟล์และตั้งค่า Content-Type ให้ตรงกับไฟล์ที่อัปโหลด
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype }
      });

      // สร้าง URL สำหรับเข้าถึงไฟล์
      const imageUrl = `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${AZURE_CONTAINER_NEWS}/${blobName}`;
      uploadedFiles.push(imageUrl);
    }

    // 3️⃣ เพิ่ม URL ของรูปภาพใน NewsImages
    for (const url of uploadedFiles) {
      await pool.request()
        .input('news_id', sql.Int, newsId)
        .input('image_url', sql.NVarChar, url)
        .query(`
          INSERT INTO NewsImages (news_id, image_url) 
          VALUES (@news_id, @image_url);
        `);
    }

    // ส่งข้อมูลกลับไปยังผู้ใช้
    res.status(200).json({
      message: "ข่าวและรูปภาพถูกอัปโหลดเรียบร้อย",
      news_id: newsId,
      image_urls: uploadedFiles
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading news and images", error: error.message });
  }
};

// ฟังก์ชันดึงข้อมูลข่าวทั้งหมด
export const getAllNews = async (req: Request, res: Response) => {
  try {
    const pool = await connectToDB();
    
    const result = await pool.request().query(`
      SELECT n.*, 
             (SELECT TOP 1 image_url FROM NewsImages WHERE news_id = n.id) as thumbnail
      FROM News n
      ORDER BY n.Create_at DESC
    `);

    res.status(200).json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Error fetching news", error: error.message });
  }
};

// ฟังก์ชันดึงข้อมูลข่าวตาม ID
export const getNewsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = await connectToDB();
    
    // ดึงข้อมูลข่าว
    const newsResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT * FROM News WHERE id = @id`);
    
    if (newsResult.recordset.length === 0) {
      return res.status(404).json({ message: "News not found" });
    }
    
    // ดึงรูปภาพที่เกี่ยวข้อง
    const imagesResult = await pool.request()
      .input('news_id', sql.Int, id)
      .query(`SELECT * FROM NewsImages WHERE news_id = @news_id`);
    
    const news = newsResult.recordset[0];
    news.images = imagesResult.recordset;
    
    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error("Error fetching news by id:", error);
    res.status(500).json({ message: "Error fetching news", error: error.message });
  }
};

// ฟังก์ชันลบข่าวตาม ID
export const deleteNewsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = await connectToDB();
    let transaction = null;
    
    try {
      // เริ่ม transaction
      transaction = pool.transaction();
      await transaction.begin();
      
      // ตรวจสอบว่ามีข่าวที่ต้องการลบหรือไม่
      const checkRequest = transaction.request();
      checkRequest.input('id', sql.Int, id);
      
      const checkResult = await checkRequest.query(`
        SELECT COUNT(*) as count 
        FROM dbo.News 
        WHERE id = @id
      `);
      
      const recordCount = checkResult.recordset[0].count;
      
      if (recordCount === 0) {
        return res.status(404).json({
          success: false,
          message: "ไม่พบข้อมูลข่าวที่ต้องการลบ"
        });
      }
      
      // ลบข้อมูลจากตาราง News
      // หมายเหตุ: NewsImages จะถูกลบอัตโนมัติเนื่องจากมีการกำหนด CASCADE constraint
      const deleteRequest = transaction.request();
      deleteRequest.input('id', sql.Int, id);
      
      await deleteRequest.query(`
        DELETE FROM dbo.News 
        WHERE id = @id
      `);
      
      // Commit transaction
      await transaction.commit();
      
      res.status(200).json({
        success: true,
        message: `ลบข้อมูลข่าวเรียบร้อยแล้ว`,
        data: {
          id: id
        }
      });
      
    } catch (error) {
      // ถ้ามีข้อผิดพลาด ให้ rollback transaction
      if (transaction) await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error("Error deleting news by id:", error);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบข้อมูลข่าว",
      error: error.message
    });
  }
};