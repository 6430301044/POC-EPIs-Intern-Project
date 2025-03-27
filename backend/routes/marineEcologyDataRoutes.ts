import express from 'express';
import { getMEPlanktonPhytosData, getMEPlanktonZoosData, getMEBenthosData, getMEFishEggsData, getMEJuvenileAquaticData } from '../controllers/marineEcology/index'

const router = express.Router();

// router.get(`/${encodeURIComponent('ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนพืช')}`, async (req, res) => {
router.get("/PlanktonPhytos", async (req, res) => {
    try {
        const offset = parseInt(req.query.offset as string) || 0;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const filters = {
            stationName: req.query.stationName as string || null,
            year: req.query.year as string || null,
            semiannual: req.query.semiannual as string || null,
        };
        const result = await getMEPlanktonPhytosData(offset, pageSize, filters);
        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching PlanktonPhytos data:", error);
        res.status(500).send('Error fetching PlanktonPhytos data');
    }
});

// router.get(`/${encodeURIComponent('ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนสัตว์')}`, async (req, res) => {
router.get("/PlanktonZoos", async (req, res) => {
    try {
        const offset = parseInt(req.query.offset as string) || 0;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const filters = {
            stationName: req.query.stationName as string || null,
            year: req.query.year as string || null,
            semiannual: req.query.semiannual as string || null,
        };
        const result = await getMEPlanktonZoosData(offset, pageSize, filters);
        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching PlanktonZoos data:", error);
        res.status(500).send('Error fetching PlanktonZoos data');
    }
});

// router.get(`/${encodeURIComponent('ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์หน้าดิน')}`, async (req, res) => {
router.get("/Benthos", async (req, res) => {
    try {
        const offset = parseInt(req.query.offset as string) || 0;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const filters = {
            stationName: req.query.stationName as string || null,
            year: req.query.year as string || null,
            semiannual: req.query.semiannual as string || null,
        };
        const result = await getMEBenthosData(offset, pageSize, filters);
        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching Benthos data:", error);
        res.status(500).send('Error fetching Benthos data');
    }
});

// router.get(`/${encodeURIComponent('ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของลูกปลาและไข่ปลา')}`, async (req, res) => {
router.get("/FishLarvaeEggs", async (req, res) => {
    try {
        const offset = parseInt(req.query.offset as string) || 0;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const filters = {
            stationName: req.query.stationName as string || null,
            year: req.query.year as string || null,
            semiannual: req.query.semiannual as string || null,
        };
        const result = await getMEFishEggsData(offset, pageSize, filters);
        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching FishEggs data:", error);
        res.status(500).send('Error fetching FishEggs data');
    }
});

// router.get(`/${encodeURIComponent('ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์น้ำวัยอ่อน')}`, async (req, res) => {
router.get("/JuvenileAquaticAnimals", async (req, res) => {
    try {
        const offset = parseInt(req.query.offset as string) || 0;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const filters = {
            stationName: req.query.stationName as string || null,
            year: req.query.year as string || null,
            semiannual: req.query.semiannual as string || null,
        };
        const result = await getMEJuvenileAquaticData(offset, pageSize, filters);
        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching JuvenileAquatic data:", error);
        res.status(500).send('Error fetching JuvenileAquatic data');
    }
});


export default router;