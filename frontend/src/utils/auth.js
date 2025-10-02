// Token management functions

/**
 * Get the JWT token from localStorage
 * @returns {string|null} The JWT token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('ayu_connect_token');
};

/**
 * Set the JWT token in localStorage
 * @param {string} token - The JWT token to store
 */
export const setToken = (token) => {
  localStorage.setItem('ayu_connect_token', token);
};

/**
 * Remove the JWT token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('ayu_connect_token');
};

/**
 * Check if the token is valid (not expired)
 * @returns {boolean} True if token is valid, false otherwise
 */
export const isTokenValid = () => {
  const token = getToken();
  
  if (!token) {
    return false;
  }
  
  try {
    // JWT tokens are in format: header.payload.signature
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    return decodedPayload.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};