import { jwtDecode } from 'jwt-decode';
import API_BASE_URL from '@/config/apiConfig'

interface DecodedToken {
  userId: string;
  name: string;
  email: string;
  role: string;
  jobPosition: string;
  phone: string;
  companyName: string;
  imageUrl: string;
  exp: number;
  [key: string]: any;
}

/**
 * Decodes the JWT token and returns the decoded data
 * @returns The decoded token or null if token is invalid
 */
export const getDecodedToken = async (): Promise<DecodedToken | null> => {
  try {
    // ส่ง request ไปยัง endpoint ที่จะส่งข้อมูลผู้ใช้กลับมา
    // เนื่องจาก token อยู่ใน HttpOnly Cookie แล้ว เราไม่สามารถอ่านมันได้โดยตรง
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'GET',
      credentials: 'include' // ส่ง cookies ไปด้วย
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Gets the user role from the decoded token
 * @returns The user role or null if not available
 */
export const getUserRole = async (): Promise<string | null> => {
  const decoded = await getDecodedToken();
  return decoded?.role || null;
};

/**
 * Checks if the current user has the specified role
 * @param role The role to check
 * @returns True if user has the role, false otherwise
 */
export const hasRole = async (role: string | string[]): Promise<boolean> => {
  const userRole = await getUserRole();
  if (!userRole) return false;
  
  if (Array.isArray(role)) {
    return role.includes(userRole);
  }
  
  return userRole === role;
};

/**
 * Checks if the user has edit permission
 * @returns True if user has edit permission
 */
export const hasEditPermission = async (): Promise<boolean> => {
  return await hasRole(['dev']);
};

/**
 * Checks if the user has approve permission
 * @returns True if user has approve permission
 */
export const hasApprovePermission = async (): Promise<boolean> => {
  return await hasRole(['approver', 'dev']);
};

/**
 * Checks if the user has add permission
 * @returns True if user has add permission
 */
export const hasAddPermission = async (): Promise<boolean> => {
  return await hasRole(['uploader', 'approver', 'dev']);
};

/**
 * Checks if the token is expired
 * @returns True if token is expired or invalid
 */
export const isTokenExpired = async (): Promise<boolean> => {
  try {
    // ส่ง request ไปยัง endpoint เพื่อตรวจสอบว่า token ยังใช้งานได้หรือไม่
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'GET',
      credentials: 'include' // ส่ง cookies ไปด้วย
    });
    
    // ถ้า response ไม่ ok แสดงว่า token หมดอายุหรือไม่ถูกต้อง
    return !response.ok;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // ถือว่าหมดอายุถ้ามี error
  }
};

/**
 * Checks if the user is authenticated
 * @returns True if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    // ส่ง request ไปยัง endpoint เพื่อตรวจสอบว่า user ยังล็อกอินอยู่หรือไม่
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'GET',
      credentials: 'include' // ส่ง cookies ไปด้วย
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};