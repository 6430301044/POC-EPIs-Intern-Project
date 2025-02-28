import express from "express";
import multer from "multer";
import { uploadCSV } from "../controllers/upload/csvUploadController";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // กำหนดโฟลเดอร์อัปโหลด

router.post("/upload-csv", upload.single("file"), uploadCSV);

export default router;
