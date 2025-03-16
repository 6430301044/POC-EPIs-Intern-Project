import { jwtDecode } from 'jwt-decode';

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
export const getDecodedToken = (): DecodedToken | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Gets the user role from the decoded token
 * @returns The user role or null if not available
 */
export const getUserRole = (): string | null => {
  const decoded = getDecodedToken();
  return decoded?.role || null;
};

/**
 * Checks if the current user has the specified role
 * @param role The role to check
 * @returns True if user has the role, false otherwise
 */
export const hasRole = (role: string | string[]): boolean => {
  const userRole = getUserRole();
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
export const hasEditPermission = (): boolean => {
  return hasRole(['admin', 'approver', 'dev']);
};

/**
 * Checks if the user has add permission
 * @returns True if user has add permission
 */
export const hasAddPermission = (): boolean => {
  return hasRole(['uploader', 'approver', 'dev']);
};

/**
 * Checks if the token is expired
 * @returns True if token is expired or invalid
 */
export const isTokenExpired = (): boolean => {
  const decoded = getDecodedToken();
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Checks if the user is authenticated
 * @returns True if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getDecodedToken() && !isTokenExpired();
};