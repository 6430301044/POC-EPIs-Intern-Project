import API_BASE_URL from '@/config/apiConfig';

/**
 * Fetches all users from the API
 * @returns Promise with user data
 */
export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch(`${API_BASE_URL}/user/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching users: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getAllUsers service:', error);
    throw error;
  }
};