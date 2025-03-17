import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig: sql.config = {
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    server: process.env.DB_SERVER || "",
    database: process.env.DB_NAME || "",
    options: {
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: false
    }
};
export async function connectToDB(): Promise<sql.ConnectionPool> {
    try {
        const pool = (await sql.connect(dbConfig)) as sql.ConnectionPool;
        console.log('✅ Connected to Azure SQL Database');
        return pool;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}