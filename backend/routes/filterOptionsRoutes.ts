import express from "express";
import { connectToDB } from "../db/dbConfig";

const router = express.Router();

const getMainCategoryIdentifier = (mainCategory: string): string => {
    const mainCategoryMappings: { [key: string]: string } = {
        "คุณภาพอากาศในบรรยากาศ": "Env_Wind",
        "คุณภาพอากาศภายในสถานประกอบการ": "Env_Air",
        "ผลการตรวจวัดคุณภาพเสียงโดยทั่วไป": "Env_Noise",
        "คุณภาพน้ำทิ้ง": "Env_WasteWater",
        "คุณภาพน้ำทะเล": "Env_SeaWater",
        "นิเวศวิทยาทางทะเล": "Env_MarineEcology"
    };
    console.log("✅ Mapping Main Category Filter:", mainCategory, "→", mainCategoryMappings[mainCategory]);
    return mainCategoryMappings[mainCategory] || "";
};

const getTableIdentifier = (subCategory: string): string => {
    const subCategoryMappings: { [key: string]: string } = {
        "ผลการตรวจวัดทิศทางและความเร็วลมเฉลี่ยรายชั่วโมง": "WDWS",
        "ผลการตรวจวัดคุณภาพอากาศในบรรยากาศ": "WindQuality",
        "ผลการตรวจวัดค่าความเข้มข้นของก๊าซซัลเฟอร์ไดออกไซด์ในบรรยากาศ": "SO2",
        "ผลการตรวจวัดสารอินทรีย์ระเหยง่ายในบรรยากาศ": "Vocs",
        "ผลการตรวจวัดคุณภาพอากาศภายในสถานประกอบการ": "AirQuality",
        "ผลการตรวจวัดระดับเสียงโดยทั่วไป": "NoiseLevel",
        "ผลการติดตามตรวจสอบ": "Monitorresult",
        "ผลการตรวจวัดคุณภาพน้ำทิ้ง": "WasteWater",
        "ผลการตรวจวัดคุณภาพน้ำทะเล": "SeaWater",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนพืช": "PlanktonPhytos",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนสัตว์": "PlanktonZoos",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์หน้าดิน": "Benthos",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของลูกปลาและไข่ปลา": "FishLarvaeEggs",
        "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์น้ำวัยอ่อน": "JuvenileAquaticAnimals"
    };
    console.log("✅ Mapping Sub Category Filter:", subCategory, "→", subCategoryMappings[subCategory]);
    return subCategoryMappings[subCategory] || "";
};

const getMainCategoryIdentifierReceived = (mainCategory: string): string => {
    const mainCategoryMappings: { [key: string]: string } = {
        "Env_Wind" : "คุณภาพอากาศในบรรยากาศ",
        "Env_Air": "คุณภาพอากาศภายในสถานประกอบการ",
        "Env_Noise": "ผลการตรวจวัดคุณภาพเสียงโดยทั่วไป",
        "Env_WasteWater": "คุณภาพน้ำทิ้ง",
        "Env_SeaWater": "คุณภาพน้ำทะเล",
        "Env_MarineEcology": "นิเวศวิทยาทางทะเล"
    };
    console.log("✅ Mapping Main Category Filter Received:", mainCategory, "→", mainCategoryMappings[mainCategory]);
    return mainCategoryMappings[mainCategory] || "";
};

const getTableIdentifierReceived = (subCategory: string): string => {
    const subCategoryMappings: { [key: string]: string } = {
        "WDWS": "ผลการตรวจวัดทิศทางและความเร็วลมเฉลี่ยรายชั่วโมง",
        "WindQuality": "ผลการตรวจวัดคุณภาพอากาศในบรรยากาศ",
        "SO2": "ผลการตรวจวัดค่าความเข้มข้นของก๊าซซัลเฟอร์ไดออกไซด์ในบรรยากาศ",
        "Vocs": "ผลการตรวจวัดสารอินทรีย์ระเหยง่ายในบรรยากาศ",
        "AirQuality": "ผลการตรวจวัดคุณภาพอากาศภายในสถานประกอบการ",
        "NoiseLevel": "ผลการตรวจวัดระดับเสียงโดยทั่วไป",
        "Monitorresult": "ผลการติดตามตรวจสอบ",
        "WasteWater": "ผลการตรวจวัดคุณภาพน้ำทิ้ง",
        "SeaWater": "ผลการตรวจวัดคุณภาพน้ำทะเล",
        "PlanktonPhytos": "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนพืช",
        "PlanktonZoos": "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของแพลงก์ตอนสัตว์",
        "Benthos": "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์หน้าดิน",
        "FishLarvaeEggs": "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของลูกปลาและไข่ปลา",
        "JuvenileAquaticAnimals": "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์น้ำวัยอ่อน"
    };
    console.log("✅ Mapping Sub Category Filter Received:", subCategory, "→", subCategoryMappings[subCategory]);
    return subCategoryMappings[subCategory] || "";
};

// API `/stations`
router.get("/stations", async (req, res) => {
    try {
        const mainCategory = getMainCategoryIdentifierReceived(req.query.mainCategory);
        const subCategory = getTableIdentifierReceived(req.query.subCategory);
        console.log("✅ Received Section Station mainCategory:", mainCategory);
        console.log("✅ Received Section Station subCategory:", subCategory);

        if (!mainCategory || !subCategory) return res.status(400).json({ error: "Missing parameters" });

        const mainCategoryIdentifier = getMainCategoryIdentifier(mainCategory);
        const subCategoryIdentifier = getTableIdentifier(subCategory);
        console.log("✅ Mapped mainCategoryIdentifier:", mainCategoryIdentifier);
        console.log("✅ Mapped subCategoryIdentifier:", subCategoryIdentifier);

        if (!mainCategoryIdentifier || !subCategoryIdentifier) {
            return res.status(400).json({ error: "Invalid category mapping" });
        }

        const tableName = `${mainCategoryIdentifier}_${subCategoryIdentifier}`;
        console.log("✅ Generated tableName Section Station:", tableName);

        const pool = await connectToDB();
        const result = await pool.request()
            .input("subCategory", subCategory)
            .query(`
                SELECT DISTINCT ms.stationName
                FROM dbo.Monitoring_Station ms
                JOIN dbo.${tableName} t ON ms.station_Id = t.station_id;
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error("❌ Database Error:", error);
        res.status(500).json({ error: "Failed to fetch stations" });
    }
});

// API `/years`
router.get("/years", async (req, res) => {
    try {
        const mainCategory = getMainCategoryIdentifierReceived(req.query.mainCategory);
        const subCategory = getTableIdentifierReceived(req.query.subCategory);
        console.log("✅ Received Section Station mainCategory:", mainCategory);
        console.log("✅ Received Section Station subCategory:", subCategory);
        if (!mainCategory || !subCategory) return res.status(400).json({ error: "Missing parameters" });

        const mainCategoryIdentifier = getMainCategoryIdentifier(mainCategory);
        const subCategoryIdentifier = getTableIdentifier(subCategory);
        if (!mainCategoryIdentifier || !subCategoryIdentifier) return res.status(400).json({ error: "Invalid category" });
        console.log("✅ Mapped mainCategoryIdentifier Section Year:", mainCategoryIdentifier);
        console.log("✅ Mapped subCategoryIdentifier Section Year:", subCategoryIdentifier);

        const tableName = `${mainCategoryIdentifier}_${subCategoryIdentifier}`;
        console.log("✅ Generated tableName Section Year:", tableName);

        const pool = await connectToDB();
        const result = await pool.request()
            .input("subCategory", subCategory)
            .query(`
                SELECT DISTINCT s.year
                FROM dbo.Semiannual s
                JOIN dbo.Daysperiod dp ON s.semiannual_Id = dp.semiannual_id
                JOIN dbo.${tableName} t ON dp.period_Id = t.period_id;
            `);

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch years" });
    }
});

// API `/semiannuals`
router.get("/semiannuals", async (req, res) => {
    try {
        const mainCategory = getMainCategoryIdentifierReceived(req.query.mainCategory);
        const subCategory = getTableIdentifierReceived(req.query.subCategory);
        console.log("✅ Received Section Station mainCategory:", mainCategory);
        console.log("✅ Received Section Station subCategory:", subCategory);
        if (!mainCategory || !subCategory) return res.status(400).json({ error: "Missing parameters" });

        const mainCategoryIdentifier = getMainCategoryIdentifier(mainCategory);
        const subCategoryIdentifier = getTableIdentifier(subCategory);
        if (!subCategoryIdentifier) return res.status(400).json({ error: "Invalid subCategory" });
        console.log("✅ Mapped mainCategoryIdentifier Section Semiannuals:", mainCategoryIdentifier);
        console.log("✅ Mapped subCategoryIdentifier Section Semiannuals:", subCategoryIdentifier);

        const tableName = `${mainCategoryIdentifier}_${subCategoryIdentifier}`;
        console.log("✅ Generated tableName Section Semiannuals:", tableName);

        const pool = await connectToDB();
        const result = await pool.request()
            .query(`SELECT DISTINCT s.semiannual FROM dbo.Semiannual s
                JOIN dbo.Daysperiod dp ON s.semiannual_Id = dp.semiannual_id
                JOIN dbo.${tableName} t ON dp.period_Id = t.period_id;`);

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch semiannuals" });
    }
});

// ✅ API ดึง Main Category
router.get("/main-categories", async (req, res) => {
    try {
        const pool = await connectToDB();
        const result = await pool.request().query("SELECT DISTINCT mainName FROM dbo.Mcategories");
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch main categories" });
    }
});

// ✅ API ดึง Sub Category ตาม `Main Category`
router.get("/sub-categories", async (req, res) => {
    try {
        const { mainCategory } = req.query;

        if (!mainCategory) {
            return res.status(400).json({ error: "Missing mainCategory parameter" });
        }

        const pool = await connectToDB();
        const result = await pool.request()
            .input("mainCategory", mainCategory)
            .query(`
                SELECT DISTINCT sc.subName 
                FROM dbo.SbCategories sc
                JOIN dbo.Mcategories mc ON sc.main_Id = mc.main_Id
                WHERE mc.mainName = @mainCategory;
            `);

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch sub categories" });
    }
});

export default router;
