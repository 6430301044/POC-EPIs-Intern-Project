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

/**
 * Updates a user's information
 * @param userId The ID of the user to update
 * @param userData The updated user data
 * @returns Promise with the update result
 */
export const updateUser = async (userId: string, userData: any) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`Error updating user: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in updateUser service:', error);
    throw error;
  }
};

/**
 * Deletes a user
 * @param userId The ID of the user to delete
 * @returns Promise with the deletion result
 */
export const deleteUser = async (userId: string) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting user: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in deleteUser service:', error);
    throw error;
  }
};