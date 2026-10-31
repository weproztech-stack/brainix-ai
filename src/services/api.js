import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://api.brainoryaiinstitute.com'; // Apna domain/port confirm kar lein

export const apiFetch = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('userToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    
    // Check if response is actually JSON
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    } else {
      const text = await response.text();
      console.log('Server returned non-JSON response:', text);
      return { 
        success: false, 
        message: `Server Error (${response.status}). Endpoint correctly configured nahi hai.` 
      };
    }
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, message: 'Network error or server unreachable.' };
  }
};