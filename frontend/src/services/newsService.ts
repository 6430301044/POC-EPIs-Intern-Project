import API_BASE_URL from '@/config/apiConfig';

export interface NewsItem {
  id: number;
  News_title: string;
  News_content: string;
  News_category: string;
  Create_at: string;
  thumbnail: string;
  News_status: string;
  images?: Array<{image_url: string}>;
}

/**
 * Fetches news data from the backend API
 * @param sortOrder - Optional parameter to sort news by date (asc or desc)
 * @param category - Optional parameter to filter news by category
 * @returns Promise with array of news items
 */
export const fetchNews = async (sortOrder: string = 'desc', category?: string): Promise<NewsItem[]> => {
  try {
    let url = `${API_BASE_URL}/news?sort=${sortOrder}`;
    if (category) {
      url += `&category=${category}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch news data');
    }
    
    const data = await response.json();
    const newsItems = Array.isArray(data.data) ? data.data : [];
    
    // If category filtering is requested, filter on the client side
    // regardless of whether the backend supports it or not
    if (category) {
      return newsItems.filter(item => item.News_category === category);
    }
    
    return newsItems;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

/**
 * Fetches a specific news item by its ID
 * @param id - The ID of the news item to fetch
 * @returns Promise with the news item data
 */
export const fetchNewsById = async (id: number): Promise<NewsItem> => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch news data');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching news by ID:', error);
    throw error;
  }
};

/**
 * Deletes a news item by its ID
 * @param id - The ID of the news item to delete
 * @returns Promise with the result of the delete operation
 */
export const deleteNewsById = async (id: number): Promise<{success: boolean; message: string; data?: any}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // ส่ง cookies ไปด้วย
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete news');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting news by ID:', error);
    throw error;
  }
};