// API Security Utility

// Get API base URL from environment variables
const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

// Get authentication token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Refresh token if expired
const refreshAuthToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      return data.access_token;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  return null;
};

// Secure API request wrapper
export const secureApiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  const url = `${getApiBaseUrl()}${endpoint}`;

  // Add authentication headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If token expired (401), try to refresh
    if (response.status === 401 && token) {
      const newToken = await refreshAuthToken();

      if (newToken) {
        // Retry request with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          },
        });
      } else {
        // Redirect to login if refresh fails
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw new Error('Authentication failed. Please login again.');
      }
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Secure GET request
export const secureGet = async (endpoint: string) => {
  const response = await secureApiRequest(endpoint, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
};

// Secure POST request
export const securePost = async (endpoint: string, data: any) => {
  const response = await secureApiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
};

// Secure PUT request
export const securePut = async (endpoint: string, data: any) => {
  const response = await secureApiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
};

// Secure DELETE request
export const secureDelete = async (endpoint: string) => {
  const response = await secureApiRequest(endpoint, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
};

// Secure file upload
export const secureFileUpload = async (endpoint: string, formData: FormData) => {
  const token = getAuthToken();
  const url = `${getApiBaseUrl()}${endpoint}`;

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    // If token expired (401), try to refresh
    if (response.status === 401 && token) {
      const newToken = await refreshAuthToken();

      if (newToken) {
        // Retry request with new token
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${newToken}`,
          },
          body: formData,
        });
      } else {
        // Redirect to login if refresh fails
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw new Error('Authentication failed. Please login again.');
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

// Logout helper
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
};
