import { Router, Request, Response } from 'express';
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import dotenv from 'dotenv';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import sql from 'mssql';
import { connectToDB } from '../db/dbConfig';

dotenv.config();

const router = Router();

// ตั้งค่า Azure Blob Storage
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME || "";
const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY || "";
const AZURE_CONTAINER_NEWS = process.env.AZURE_CONTAINER_NEWS || "newsimage";

const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY)
);

const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NEWS);

// ใช้ Multer สำหรับอัปโหลดไฟล์
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      cb(null, false);
      return;
    }
    cb(null, true);
  }
});

// ฟังก์ชันตรวจสอบคอนเทนเนอร์
async function ensureContainerExists() {
  const exists = await containerClient.exists();
  if (!exists) {
    await containerClient.create();
    console.log(`✅ Created container: ${AZURE_CONTAINER_NEWS}`);
  }
}

// API สำหรับอัปโหลดข่าวพร้อมรูปภาพ
router.post("/", upload.array("file", 10), async (req: Request, res: Response) => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    res.status(400).json({ message: "No files uploaded" });
    return;
  }

  const { title, content, category, Create_by } = req.body;

  if (!title || !content || !category || !Create_by) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    await ensureContainerExists(); // ตรวจสอบและสร้างคอนเทนเนอร์ถ้ายังไม่มี

    // เชื่อมต่อฐานข้อมูล
    const pool = await connectToDB();

    // 1️⃣ เพิ่มข้อมูลข่าวเข้า News
    const result = await pool.request()
      .input('News_category', sql.NVarChar, category)
      .input('News_title', sql.NVarChar, title)
      .input('News_content', sql.NVarChar, content)
      .input('Create_by', sql.Int, Create_by)
      .input('News_status', sql.NVarChar, "Pending")
      .query(`
        INSERT INTO News (News_category, News_title, News_content, Create_by, News_status)
        VALUES (@News_category, @News_title, @News_content, @Create_by, @News_status);
        SELECT SCOPE_IDENTITY() AS news_id;
      `);

    const newsId = result.recordset[0].news_id; // ดึง id ของข่าวที่เพิ่งเพิ่ม

    // 2️⃣ อัปโหลดรูปภาพไปยัง Azure Blob Storage
    const uploadedFiles: string[] = [];
    for (const file of (req.files as Express.Multer.File[])) {
      const fileExtension = file.originalname.split(".").pop();
      const blobName = `${uuidv4()}.${fileExtension}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype }
      });

      uploadedFiles.push(`${containerClient.url}/${blobName}`);
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

    res.status(200).json({
      message: "ข่าวและรูปภาพถูกอัปโหลดเรียบร้อย",
      news_id: newsId,
      image_urls: uploadedFiles
    });
    return;

  } catch (error) {
    console.error("Error in file upload:", error);
    res.status(500).json({ message: "Error uploading files", error: error.message });
    return;
  }
});

export default router;