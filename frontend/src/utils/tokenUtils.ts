import { jwtDecode } from 'jwt-decode';
import API_BASE_URL from '@/config/apiConfig';

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
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded || !decoded.userId) return false;
    
    // Create a new token with the updated image URL
    const response = await fetch(`${API_BASE_URL}/user/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: decoded.userId,
        imageUrl: imageUrl
      })
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      
      // Dispatch a custom event to notify components that the token has been refreshed
      // This is needed because the 'storage' event only fires for changes from other tabs
      const tokenRefreshedEvent = new Event('token-refreshed');
      window.dispatchEvent(tokenRefreshedEvent);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};