// ============================================================
//  API Base URL & Central HTTP Client
// ============================================================

import { toastError } from './toast';

export const API_BASE = 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  isUpload?: boolean;
}

async function request(endpoint: string, options: RequestOptions = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  // Auto-inject Auth Token
  const token = localStorage.getItem('morango_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Set json content-type if not files upload
  if (!options.isUpload && !headers.has('Content-Type') && (options.method && options.method !== 'GET')) {
    headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };
  
  // Remove isUpload helper key from raw fetch options
  delete (fetchOptions as any).isUpload;

  try {
    const res = await fetch(url, fetchOptions);
    
    // Auto logout on token expiration (401)
    if (res.status === 401) {
      localStorage.removeItem('morango_token');
      localStorage.removeItem('morango_view');
      window.dispatchEvent(new Event('auth_session_expired'));
      toastError('Your session has expired. Please log in again.');
      throw new Error('Unauthorized session expired');
    }

    if (!res.ok) {
      // Attempt parsing error payload
      let errMsg = 'Something went wrong';
      try {
        const errorData = await res.json();
        errMsg = errorData.error || errMsg;
      } catch {
        // Fallback to text status
        errMsg = res.statusText || errMsg;
      }
      throw new Error(errMsg);
    }

    // Handle empty response bodies (like DELETE or 204 No Content)
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    return null;
  } catch (e: any) {
    if (e.message !== 'Unauthorized session expired') {
      console.error(`API Error on ${options.method || 'GET'} ${endpoint}:`, e.message);
    }
    throw e;
  }
}

export const api = {
  get: (endpoint: string, options?: RequestOptions) => 
    request(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint: string, body?: any, options?: RequestOptions) => 
    request(endpoint, { 
      ...options, 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined 
    }),
    
  put: (endpoint: string, body?: any, options?: RequestOptions) => 
    request(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined 
    }),
    
  delete: (endpoint: string, options?: RequestOptions) => 
    request(endpoint, { ...options, method: 'DELETE' }),
    
  upload: (endpoint: string, formData: FormData, options?: RequestOptions) => 
    request(endpoint, { 
      ...options, 
      method: 'POST', 
      body: formData, 
      isUpload: true 
    }),
};
