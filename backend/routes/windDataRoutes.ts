import express from 'express';
import { getWindWDWSData, getWindWindQualityData, getWindSO2Data, getWindVocsData } from '../controllers/windData/index';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// router.get(`/${encodeURIComponent('ผลการตรวจวัดทิศทางและความเร็วลมเฉลี่ยรายชั่วโมง')}`, async (req, res) => {
    router.get("/WDWS", async (req, res) => {
        try {
            const offset = parseInt(req.query.offset as string) || 0;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const filters = {
                stationName: req.query.stationName as string || null,
                year: req.query.year as string || null,
                semiannual: req.query.semiannual as string || null,
            };
    
            const result = await getWindWDWSData(offset, pageSize, filters);
            res.json(result);
        } catch (error) {
            console.error("❌ Error fetching wind-direction & wind-speed data:", error);
            res.status(500).send("Error fetching wind-direction & wind-speed data");
        }
    });
    

// router.get(`/${encodeURIComponent('ผลการตรวจวัดคุณภาพอากาศในบรรยากาศ')}`, async (req, res) => {
    router.get("/WindQuality", async (req, res) => {
        try {
            const offset = parseInt(req.query.offset as string) || 0;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const filters = {
                stationName: req.query.stationName as string || null,
                year: req.query.year as string || null,
                semiannual: req.query.semiannual as string || null,
            };
    
            const result = await getWindWindQualityData(offset, pageSize, filters);
            res.json(result);
        } catch (error) {
            console.error("❌ Error fetching wind quality data:", error);
            res.status(500).send("Error fetching wind quality data");
        }
    });
    

// router.get(`/${encodeURIComponent('ผลการตรวจวัดค่าความเข้มข้นของก๊าซซัลเฟอร์ไดออกไซด์ในบรรยากาศ')}`, async (req, res) => {
    router.get("/SO2", async (req, res) => {
        try {
            const offset = parseInt(req.query.offset as string) || 0;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const filters = {
                stationName: req.query.stationName as string || null,
                year: req.query.year as string || null,
                semiannual: req.query.semiannual as string || null,
            };
    
            const result = await getWindSO2Data(offset, pageSize, filters);
            res.json(result);
        } catch (error) {
            console.error("❌ Error fetching SO2 data:", error);
            res.status(500).send("Error fetching SO2 data");
        }
    });
    

// router.get(`/${encodeURIComponent('ผลการตรวจวัดสารอินทรีย์ระเหยง่ายในบรรยากาศ')}`, async (req, res) => {
router.get('/Vocs', async (req, res) => {
    try {
        const offset = parseInt(req.query.offset as string) || 0;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const filters = {
            stationName: req.query.stationName as string || null,
            year: req.query.year as string || null,
            semiannual: req.query.semiannual as string || null,
        };
        const result = await getWindVocsData(offset, pageSize, filters);
        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching Vocs data:", error);
        res.status(500).send('Error fetching Vocs data');
    }
});

export default router;