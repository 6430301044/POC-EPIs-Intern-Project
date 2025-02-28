import API_BASE_URL from "@/config/apiConfig";

const getMainCategoryIdentifier = (mainCategory: string): string => {
    const mainCategoryMappings: { [key: string]: string } = {
        "คุณภาพอากาศในบรรยากาศ": "Env_Wind",
        "คุณภาพอากาศภายในสถานประกอบการ": "Env_Air",
        "ผลการตรวจวัดคุณภาพเสียงโดยทั่วไป": "Env_Noise",
        "คุณภาพน้ำทิ้ง": "Env_WasteWater",
        "คุณภาพน้ำทะเล": "Env_SeaWater",
        "นิเวศวิทยาทางทะเล": "Env_MarineEcology"
    };
    console.log("✅ Mapping Main Category:", mainCategory, "→", mainCategoryMappings[mainCategory]);
    return mainCategoryMappings[mainCategory] || "";
};

// ✅ ฟังก์ชันแมป `Sub Category` ภาษาไทยเป็น `Table Identifier`
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
        "Benthos": "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์หน้าดิน",
        "FishLarvaeEggs": "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของลูกปลาและไข่ปลา",
        "JuvenileAquaticAnimals": "ผลการสำรวจชนิด ปริมาณ และความหนาแน่นของสัตว์น้ำวัยอ่อน"
    };
    console.log("✅ Mapping Sub Category:", subCategory, "→", subCategoryMappings[subCategory]);
    return subCategoryMappings[subCategory] || "";
};

// ✅ ดึง `Main Category`
export const fetchMainCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/filter-options/main-categories`);
        const data = await response.json();

        console.log("✅ FetchMainCategories Response:", data); // ✅ Debug API Response

        if (!Array.isArray(data)) {
            console.error("❌ FetchMainCategories: Response is not an array!");
            return [];
        }

        return data;
    } catch (error) {
        console.error("❌ Error fetching main categories:", error);
        return [];
    }
};

// ✅ ดึง `Sub Category` ตาม `Main Category`
export const fetchSubCategories = async (mainCategory: string) => {
    const response = await fetch(`${API_BASE_URL}/filter-options/sub-categories?mainCategory=${encodeURIComponent(mainCategory)}`);
    return await response.json();
};

// ✅ ดึง `Stations` โดยใช้ `Table Identifier`
export const fetchStations = async (mainCategory: string, subCategory: string) => {
    const mainCategoryIdentifier = getMainCategoryIdentifier(mainCategory);
    const tableIdentifier = getTableIdentifier(subCategory);

    console.log("✅ Sending API Request for:", mainCategoryIdentifier, tableIdentifier);
    
    const response = await fetch(`${API_BASE_URL}/filter-options/stations?mainCategory=${encodeURIComponent(mainCategoryIdentifier)}&subCategory=${encodeURIComponent(tableIdentifier)}`);
    return await response.json();
};

// ✅ ดึง `Years`
export const fetchYears = async (mainCategory: string, subCategory: string) => {
    const mainCategoryIdentifier = getMainCategoryIdentifier(mainCategory);
    const tableIdentifier = getTableIdentifier(subCategory);

    console.log("✅ Sending API Request for:", mainCategoryIdentifier, tableIdentifier);
    
    const response = await fetch(`${API_BASE_URL}/filter-options/years?mainCategory=${encodeURIComponent(mainCategoryIdentifier)}&subCategory=${encodeURIComponent(tableIdentifier)}`);
    return await response.json();
};

// ✅ ดึง `Semiannuals`
export const fetchSemiannuals = async (mainCategory: string, subCategory: string) => {
    const mainCategoryIdentifier = getMainCategoryIdentifier(mainCategory);
    const tableIdentifier = getTableIdentifier(subCategory);

    console.log("✅ Sending API Request for:", mainCategoryIdentifier, tableIdentifier);
    
    const response = await fetch(`${API_BASE_URL}/filter-options/semiannuals?mainCategory=${encodeURIComponent(mainCategoryIdentifier)}&subCategory=${encodeURIComponent(tableIdentifier)}`);
    return await response.json();
};

// ✅ ดึง `Environmental Data` ตาม `Main Category` และ `Sub Category`
export const fetchEnvironmentalData = async (mainCategory: string, subCategory: string, filters: any) => {
    try {
        const mainCategoryIdentifier = getMainCategoryIdentifier(mainCategory);
        const tableIdentifier = getTableIdentifier(subCategory);

        console.log("✅ Section fetchEnvironmentalData mainCategory:", mainCategory);
        console.log("✅ Section fetchEnvironmentalData subCategory:", subCategory);

        if (!tableIdentifier) {
            throw new Error(`Invalid subCategory: ${encodeURIComponent(subCategory)}`);
        } else {
            console.log("✅ tableIdentifier Pass:", mainCategoryIdentifier, tableIdentifier);
        }

        const query = new URLSearchParams(filters).toString();
        let response;
        
        switch (mainCategoryIdentifier) {
            case "Env_Wind":
            case "Env_Air":
            case "Env_Noise":
            case "Env_WasteWater":
            case "Env_SeaWater":
            case "Env_MarineEcology":
                response = await fetch(`${API_BASE_URL}/${mainCategoryIdentifier}/${tableIdentifier}?${query}`);
                break;
            default:
                throw new Error("Invalid category");
        }

        if (!response.ok) {
            throw new Error("Failed to fetch environmental data");
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Error fetching environmental data:", error);
        return [];
    }
};