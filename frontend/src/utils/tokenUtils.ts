import { jwtDecode } from 'jwt-decode';
import API_BASE_URL from '@/config/apiConfig';
import { getDecodedToken } from './authUtils';

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
 * Refreshes the JWT token with updated user data
 * @param imageUrl The new image URL to update in the token
 * @returns A promise that resolves to true if successful, false otherwise
 */
export const refreshTokenWithNewImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // ดึงข้อมูลผู้ใช้ปัจจุบัน
    const userData = await getDecodedToken();
    if (!userData || !userData.userId) return false;
    
    // Create a new token with the updated image URL
    const response = await fetch(`${API_BASE_URL}/user/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // ส่ง cookies ไปด้วย
      body: JSON.stringify({
        userId: userData.userId,
        imageUrl: imageUrl
      })
    });
    
    if (!response.ok) return false;
    
    // Dispatch a custom event to notify components that the token has been refreshed
    const tokenRefreshedEvent = new Event('token-refreshed');
    window.dispatchEvent(tokenRefreshedEvent);
    
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};