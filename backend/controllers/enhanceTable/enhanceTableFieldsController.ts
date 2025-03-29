import { Request, Response } from "express";
import { connectToDB } from "../../db/dbConfig";

/**
 * Controller for fetching EnhanceTable fields structure
 * This controller retrieves the field structure for a specific EnhanceTable
 */
export const getEnhanceTableFields = async (req: Request, res: Response) => {
    try {
        const { enhanceTableId } = req.params;
        
        if (!enhanceTableId) {
            res.status(400).json({
                success: false,
                message: "กรุณาระบุ enhanceTableId"
            });
            return;
        }
        
        // Get the field structure based on enhanceTableId
        const fieldStructure = getFieldStructure(enhanceTableId);
        
        // Return the data as JSON
        res.status(200).json({
            success: true,
            data: fieldStructure
        });
        return;
        
    } catch (error) {
        console.error("Error fetching EnhanceTable fields:", error);
        res.status(500).json({ 
            success: false, 
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลโครงสร้างฟิลด์", 
            error: error.message 
        });
        return;
    }
};

/**
 * Get field structure for the EnhanceTable
 */
const getFieldStructure = (enhanceId: string): { name: string, type: string, required: boolean }[] => {
    // Define default fields for all enhance tables
    const defaultFields = [
        { name: 'station_id', type: 'int', required: true },
        { name: 'indexName', type: 'string', required: true },
    ];
    
    // Add specific fields based on enhanceId
    const specificFields: { [key: string]: { name: string, type: string, required: boolean }[] } = {
        "1": [ // WDWS_Calm
            ...defaultFields,
            { name: 'calmValue', type: 'decimal', required: true }
        ],
        "2": [ // SO2
            ...defaultFields,
            { name: 'day1st_result_ppm', type: 'decimal', required: true },
            { name: 'day2nd_result_ppm', type: 'decimal', required: true },
            { name: 'day3rd_result_ppm', type: 'decimal', required: true }
        ],
        "3": [ // NoiseLevelNormal
            ...defaultFields,
            { name: 'day1st_result', type: 'decimal', required: true },
            { name: 'day2nd_result', type: 'decimal', required: true },
            { name: 'day3rd_result', type: 'decimal', required: true }
        ],
        "4": [ // NoiseLevel90_Average
            ...defaultFields,
            { name: 'day1st_result', type: 'decimal', required: true },
            { name: 'day2nd_result', type: 'decimal', required: true },
            { name: 'day3rd_result', type: 'decimal', required: true }
        ],
        "5": [ // Monitorresult
            ...defaultFields,
            { name: 'day1st_Leq', type: 'decimal', required: true },
            { name: 'day1st_L90', type: 'decimal', required: true },
            { name: 'day2nd_Leq', type: 'decimal', required: true },
            { name: 'day2nd_L90', type: 'decimal', required: true },
            { name: 'day3rd_Leq', type: 'decimal', required: true },
            { name: 'day3rd_L90', type: 'decimal', required: true }
        ],
        "6": [ // PlanktonPhytos
            ...defaultFields,
            { name: 'quantity_per_m3', type: 'decimal', required: true }
        ],
        "7": [ // PlanktonZoos
            ...defaultFields,
            { name: 'quantity_per_m3', type: 'decimal', required: true }
        ],
        "8": [ // Benthos
            ...defaultFields,
            { name: 'quantity_per_m2', type: 'decimal', required: true }
        ],
        "9": [ // FishLarvaeEggs
            ...defaultFields,
            { name: 'quantity_per_1000m3', type: 'decimal', required: true }
        ],
        "10": [ // JuvenileAquaticAnimals
            ...defaultFields,
            { name: 'quantity_per_1000m3', type: 'decimal', required: true }
        ]
    };
    
    // Add remark field to all tables (optional field)
    const fieldsWithRemark = [...(specificFields[enhanceId] || defaultFields), 
        { name: 'remark', type: 'string', required: false }
    ];
    
    return fieldsWithRemark;
};