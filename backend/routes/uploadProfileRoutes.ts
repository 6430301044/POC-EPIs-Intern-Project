// uploadProfileRoutes.ts
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
const AZURE_CONTAINER_PROFILE = process.env.AZURE_CONTAINER_PROFILE || "";

// สร้าง Blob Service Client
const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY)
);

// ดึง Client ของ Container
const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_PROFILE);

// ใช้ Multer สำหรับอัปโหลดไฟล์
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      return cb(new Error('Only JPEG and PNG files are allowed'), false);
    }
    cb(null, true); // Allow the file
  }
});

// API สำหรับอัปโหลดไฟล์โปรไฟล์
router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    await ensureContainerExists(); // ตรวจสอบและสร้างคอนเทนเนอร์ถ้ายังไม่มี

    const fileExtension = req.file.originalname.split(".").pop(); // ดึงนามสกุลไฟล์
    const blobName = `${uuidv4()}.${fileExtension}`; // ใช้ UUID ป้องกันไฟล์ซ้ำ
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // อัปโหลดไฟล์และตั้งค่า Content-Type
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

// ฟังก์ชันตรวจสอบคอนเทนเนอร์
async function ensureContainerExists() {
  const exists = await containerClient.exists();
  if (!exists) {
    await containerClient.create();
    console.log(`✅ Created container: ${AZURE_CONTAINER_PROFILE}`);
  }
}

export default router;
