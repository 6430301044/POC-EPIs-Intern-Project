import express from "express";
import windDataRoutes from "./windDataRoutes";
import airQualityDataRoutes from "./airQualityDataRoutes";
import marineEcologyDataRoutes from "./marineEcologyDataRoutes";
import noiseLevelDataRoutes from "./noiseLevelDataRoutes";
import seaWaterDataRoutes from "./seaWaterDataRoutes";
import wasteWaterDataRoutes from "./wasteWaterDataRoutes";
import uploadRoutes from "./uploadRoutes";
import filterOptionsRoutes from "./filterOptionsRoutes";

const router = express.Router();

// router.use(`/${encodeURIComponent('คุณภาพอากาศในบรรยากาศ')}`, windDataRoutes);
// router.use(`/${encodeURIComponent('คุณภาพอากาศภายในสถานประกอบการ')}`, airQualityDataRoutes);
// router.use(`/${encodeURIComponent('ผลการตรวจวัดคุณภาพเสียงโดยทั่วไป')}`, marineEcologyDataRoutes);
// router.use(`/${encodeURIComponent('คุณภาพน้ำทิ้ง')}`, noiseLevelDataRoutes);
// router.use(`/${encodeURIComponent('คุณภาพน้ำทะเล')}`, seaWaterDataRoutes);
// router.use(`/${encodeURIComponent('นิเวศวิทยาทางทะเล')}`, wasteWaterDataRoutes);
router.use("/Env_Wind", windDataRoutes);
router.use("/Env_Air", airQualityDataRoutes);
router.use("/Env_MarineEcology", marineEcologyDataRoutes);
router.use("/Env_Noise", noiseLevelDataRoutes);
router.use("/Env_SeaWater", seaWaterDataRoutes);
router.use("/Env_WasteWater", wasteWaterDataRoutes);
router.use("/upload", uploadRoutes);
router.use("/filter-options", filterOptionsRoutes);

export default router;