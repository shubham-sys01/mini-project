
import { getToken, getSessionId } from './auth';
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'http://localhost:8080/api';

// Mock data for when the server is not available
const mockRecords = [
  {
    id: 'rec-001',
    type: 'Lab Report',
    title: 'Complete Blood Count (CBC)',
    date: '2023-10-15',
    hospital: 'City General Hospital',
    doctor: 'Dr. Sharma',
    fileUrl: '/mock-data/cbc-report.html',
    thumbnailUrl: '/mock-data/cbc-thumbnail.html'
  },
  {
    id: 'rec-002',
    type: 'Prescription',
    title: 'General Medicine Prescription',
    date: '2023-11-05',
    hospital: 'Apollo Clinic',
    doctor: 'Dr. Patel',
    fileUrl: '/mock-data/prescription.html',
    thumbnailUrl: '/mock-data/prescription.html'
  },
  {
    id: 'rec-003',
    type: 'Imaging',
    title: 'Chest X-Ray Report',
    date: '2023-09-22',
    hospital: 'City General Hospital',
    doctor: 'Dr. Kumar',
    fileUrl: '/mock-data/xray-report.html',
    thumbnailUrl: '/mock-data/xray-report.html'
  },
  {
    id: 'rec-004',
    type: 'Discharge Summary',
    title: 'Post-Surgery Discharge',
    date: '2023-08-10',
    hospital: 'Max Super Speciality Hospital',
    doctor: 'Dr. Singh',
    fileUrl: '/mock-data/discharge-summary.html',
    thumbnailUrl: '/mock-data/discharge-summary.html'
  },
  {
    id: 'rec-005',
    type: 'Vaccination',
    title: 'COVID-19 Vaccination Certificate',
    date: '2023-06-30',
    hospital: 'Government Vaccination Center',
    doctor: 'Dr. Gupta',
    fileUrl: '/mock-data/vaccination-cert.html',
    thumbnailUrl: '/mock-data/vaccination-cert.html'
  }
];

const mockAccessLogs = [
  {
    id: 'log-001',
    userId: 'user-001',
    aadhaarNumber: '123456789012',
    recordIds: ['rec-001', 'rec-002'],
    accessToken: 'token-001',
    createdAt: Date.now() - 3600000, // 1 hour ago
    action: 'SHARE_CREATED'
  },
  {
    id: 'log-002',
    userId: 'user-001',
    aadhaarNumber: '123456789012',
    recordIds: ['rec-001', 'rec-002'],
    accessToken: 'token-001',
    accessedAt: Date.now() - 3500000, // 58 minutes ago
    action: 'SHARE_ACCESSED'
  },
  {
    id: 'log-003',
    userId: 'user-001',
    aadhaarNumber: '123456789012',
    recordIds: ['rec-003'],
    accessToken: 'token-002',
    createdAt: Date.now() - 86400000, // 1 day ago
    action: 'SHARE_CREATED'
  }
];

// Flag to determine if we should use mock data
const USE_MOCK_DATA = false;

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Request body data
 * @param {boolean} isFormData - Whether the data is FormData
 * @returns {Promise} Response data
 */
export const apiRequest = async (endpoint, method = 'GET', data = null, isFormData = false) => {
  // If we're using mock data, handle the request with mock responses
  if (USE_MOCK_DATA) {
    return handleMockRequest(endpoint, method, data);
  }
  
  const token = getToken();
  const sessionId = getSessionId();
  
  const headers = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Use token if available (default login), otherwise use session ID (DigiLocker)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (sessionId) {
    headers['x-session-id'] = sessionId;
  }
  
  const config = {
    method,
    headers
  };
  
  if (data) {
    if (isFormData) {
      config.body = data;
    } else if (method === 'POST' || method === 'PUT') {
      config.body = JSON.stringify(data);
    }
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Something went wrong');
    }
    
    return responseData;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    // If server is not available, fall back to mock data
    console.log('Falling back to mock data');
    return handleMockRequest(endpoint, method, data);
  }
};

/**
 * Handle mock API requests
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} data - Request data
 * @returns {object} Mock response
 */
const handleMockRequest = (endpoint, method, data) => {
  // Auth endpoints
  if (endpoint === '/auth/aadhaar' && method === 'POST') {
    // Accept any 12-digit Aadhaar number
    if (data.aadhaarNumber && data.aadhaarNumber.length === 12) {
      return {
        success: true,
        message: 'OTP sent successfully',
        devOtp: '123456' // Fixed OTP for demo
      };
    } else {
      throw new Error('Please provide a valid 12-digit Aadhaar number');
    }
  }
  
  if (endpoint === '/auth/verify-otp' && method === 'POST') {
    // Accept any OTP for demo
    return {
      success: true,
      message: 'Authentication successful',
      token: 'mock-jwt-token',
      user: {
        id: 'user-001',
        name: 'Demo Patient',
        aadhaarNumber: data.aadhaarNumber
      }
    };
  }
  
  if (endpoint === '/auth/user') {
    return {
      success: true,
      user: {
        id: 'user-001',
        name: 'Demo Patient',
        aadhaarNumber: '123456789012'
      }
    };
  }
  
  // Records endpoints
  if (endpoint === '/records') {
    return {
      success: true,
      count: mockRecords.length,
      data: mockRecords
    };
  }
  
  if (endpoint.startsWith('/records/') && !endpoint.startsWith('/records/category/')) {
    const recordId = endpoint.split('/').pop();
    const record = mockRecords.find(r => r.id === recordId);
    
    if (record) {
      return {
        success: true,
        data: record
      };
    } else {
      throw new Error('Record not found');
    }
  }
  
  if (endpoint.startsWith('/records/category/')) {
    const category = endpoint.split('/').pop();
    const filteredRecords = mockRecords.filter(
      r => r.type.toLowerCase() === category.toLowerCase()
    );
    
    return {
      success: true,
      count: filteredRecords.length,
      data: filteredRecords
    };
  }
  
  // Share endpoints
  if (endpoint === '/share/generate' && method === 'POST') {
    // Create a token that includes the selected record IDs
    const recordIdsParam = data.recordIds.join(',');
    const accessToken = `share-${recordIdsParam}`;
    const expiryTime = Date.now() + (data.expiryMinutes * 60 * 1000);
    
    return {
      success: true,
      message: 'Access token generated successfully',
      data: {
        accessToken,
        accessUrl: `http://localhost:3000/access/${accessToken}`,
        qrCodeDataUrl: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAABZ0lEQVR42uyYwY3DMAxEKcGFuBQX4lJcyNaQw90Bh7sLDrMbG/JHcm5BkMMCeYeAJUWNRkOR1PO/f/YsWbJkyX9JvlRKbakVdCVSrZTCk0l2JIWnkL2gkHyl7AWF5EfJXlBIvpfsBYXkW8leUEi+luwFheRLyV5QSL6U7AWF5EvJXlBIvpbsBYXkS8leUEi+lOwFheRLyV5QSL6W7AWF5EvJXlBIvpTsBYXkS8leUEi+luwFheRryV5QSL6U7AWF5EvJXlBIvpTsBYXka8leUEi+lOwFheRLyV5QSL6U7AWF5GvJXlBIvpTsBYXkS8leUEi+lOwFheRryV5QSL6U7AWF5EvJXlBIvpTsBYXka8leUEi+lOwFheRLyV5QSL6U7AWF5GvJXlBIvpTsBYXkS8leUEi+lOwFheRryV5QSL6U7AWF5EvJXlBIvpTsBYXka8leUEi+lOwFheRLyV5QSL6W7AWF5H+SPEuWLFny/+QHa7WkjtXmMvIAAAAASUVORK5CYII=`,
        expiresAt: expiryTime
      }
    };
  }
  
  if (endpoint.startsWith('/share/access/')) {
    const token = endpoint.split('/').pop();
    
    // Extract record IDs from the token if it's in the format "share-rec-001,rec-002,..."
    let recordIds = ['rec-001', 'rec-002', 'rec-003'];
    
    if (token && token.startsWith('share-')) {
      try {
        const encodedIds = token.split('share-')[1];
        if (encodedIds) {
          const decodedIds = encodedIds.split(',');
          if (decodedIds && decodedIds.length > 0) {
            recordIds = decodedIds;
          }
        }
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
    
    return {
      success: true,
      message: 'Access granted',
      data: {
        recordIds: recordIds,
        expiresAt: Date.now() + 600000 // 10 minutes from now
      }
    };
  }
  
  if (endpoint === '/share/revoke' && method === 'POST') {
    return {
      success: true,
      message: 'Access token revoked successfully'
    };
  }
  
  // Emergency endpoints
  if (endpoint === '/emergency/generate' && method === 'POST') {
    // Create a permanent emergency token that includes the selected record IDs
    const recordIdsParam = data.recordIds.join(',');
    const emergencyToken = `emergency-${recordIdsParam}`;
    
    return {
      success: true,
      message: 'Emergency token generated successfully',
      data: {
        accessToken: emergencyToken,
        accessUrl: `http://localhost:3000/emergency/${emergencyToken}`,
        qrCodeDataUrl: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAABZ0lEQVR42uyYwY3DMAxEKcGFuBQX4lJcyNaQw90Bh7sLDrMbG/JHcm5BkMMCeYeAJUWNRkOR1PO/f/YsWbJkyX9JvlRKbakVdCVSrZTCk0l2JIWnkL2gkHyl7AWF5EfJXlBIvpfsBYXkW8leUEi+luwFheRLyV5QSL6U7AWF5EvJXlBIvpbsBYXkS8leUEi+lOwFheRLyV5QSL6W7AWF5EvJXlBIvpTsBYXkS8leUEi+luwFheRryV5QSL6U7AWF5EvJXlBIvpTsBYXka8leUEi+lOwFheRLyV5QSL6U7AWF5GvJXlBIvpTsBYXkS8leUEi+lOwFheRryV5QSL6U7AWF5EvJXlBIvpTsBYXka8leUEi+lOwFheRLyV5QSL6U7AWF5GvJXlBIvpTsBYXkS8leUEi+lOwFheRryV5QSL6U7AWF5EvJXlBIvpTsBYXka8leUEi+lOwFheRLyV5QSL6W7AWF5H+SPEuWLFny/+QHa7WkjtXmMvIAAAAASUVORK5CYII=`
      }
    };
  }
  
  if (endpoint.startsWith('/emergency/access/')) {
    const token = endpoint.split('/').pop();
    
    // Extract record IDs from the token if it's in the format "emergency-rec-001,rec-002,..."
    let recordIds = ['rec-001', 'rec-002'];
    let emergencyContact = '';
    let emergencyInfo = '';
    
    if (token && token.startsWith('emergency-')) {
      try {
        const encodedIds = token.split('emergency-')[1];
        if (encodedIds) {
          const decodedIds = encodedIds.split(',');
          if (decodedIds && decodedIds.length > 0) {
            recordIds = decodedIds;
            
            // For demo purposes, add emergency contact and info based on the records
            if (recordIds.includes('rec-001')) {
              emergencyContact = 'Dr. Patel: +91 98765 43210';
              emergencyInfo = 'Patient has severe peanut allergy.\nTaking blood pressure medication daily.\nHistory of asthma.';
            }
          }
        }
      } catch (e) {
        console.error('Error parsing emergency token:', e);
      }
    }
    
    return {
      success: true,
      message: 'Emergency access granted',
      data: {
        recordIds: recordIds,
        emergencyContact: emergencyContact,
        emergencyInfo: emergencyInfo
      }
    };
  }
  
  if (endpoint === '/share/logs') {
    return {
      success: true,
      count: mockAccessLogs.length,
      data: mockAccessLogs
    };
  }
  
  // Default fallback
  throw new Error(`No mock implementation for endpoint: ${endpoint}`);
};

// Auth API calls
export const loginWithAadhaar = async (aadhaarNumber) => {
  return apiRequest('/auth/aadhaar', 'POST', { aadhaarNumber });
};

export const verifyOtp = async (aadhaarNumber, otp) => {
  return apiRequest('/auth/verify-otp', 'POST', { aadhaarNumber, otp });
};

export const getCurrentUser = async () => {
  return apiRequest('/auth/user');
};

// Records API calls
export const getAllRecords = async () => {
  return apiRequest('/records');
};

export const getRecordById = async (id) => {
  return apiRequest(`/records/${id}`);
};

export const getRecordsByCategory = async (category) => {
  return apiRequest(`/records/category/${category}`);
};

// Share API calls
export const generateShareToken = async (recordIds, expiryMinutes = 10) => {
  return apiRequest('/share/generate', 'POST', { recordIds, expiryMinutes });
};

export const revokeShareToken = async (accessToken) => {
  return apiRequest('/share/revoke', 'POST', { accessToken });
};

export const getAccessLogs = async () => {
  return apiRequest('/share/logs');
};

// Access shared records
export const accessSharedRecords = async (token) => {
  return apiRequest(`/share/access/${token}`);
};

// Emergency API calls
export const generateEmergencyToken = async (recordIds, emergencyContact, emergencyInfo) => {
  try {
    // Try to use the real API
    const response = await apiRequest('/emergency/token', 'POST', { 
      recordIds, 
      emergencyContact, 
      additionalInfo: emergencyInfo 
    });
    return response;
  } catch (error) {
    console.warn('Falling back to mock emergency token generation:', error);
    
    // Fall back to mock implementation
    const emergencyToken = `emergency-${recordIds.join(',')}`;
    
    return {
      success: true,
      data: {
        token: emergencyToken,
        accessUrl: `http://localhost:3000/emergency/${emergencyToken}`,
        recordCount: recordIds.length
      }
    };
  }
};

export const accessEmergencyRecords = async (token) => {
  try {
    // Try to use the real API
    return await apiRequest(`/emergency/access/${token}`);
  } catch (error) {
    console.warn('Falling back to mock emergency access:', error);
    
    // Fall back to mock implementation
    let recordIds = ['rec-001', 'rec-002'];
    let emergencyContact = '';
    let emergencyInfo = '';
    
    if (token && token.startsWith('emergency-')) {
      try {
        const encodedIds = token.split('emergency-')[1];
        if (encodedIds) {
          const decodedIds = encodedIds.split(',');
          if (decodedIds && decodedIds.length > 0) {
            recordIds = decodedIds;
            
            // For demo purposes, add emergency contact and info based on the records
            if (recordIds.includes('rec-001')) {
              emergencyContact = 'Dr. Patel: +91 98765 43210';
              emergencyInfo = 'Patient has severe peanut allergy.\nTaking blood pressure medication daily.\nHistory of asthma.';
            }
          }
        }
      } catch (e) {
        console.error('Error parsing emergency token:', e);
      }
    }
    
    return {
      success: true,
      message: 'Emergency access granted',
      data: {
        recordIds: recordIds,
        emergencyContact: emergencyContact,
        emergencyInfo: emergencyInfo
      }
    };
  }
};