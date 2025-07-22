// API configuration to handle SSL certificate issues during build time
import https from 'https';

// Create a custom HTTPS agent that ignores SSL certificate errors
// This is a workaround for API servers with misconfigured SSL certificates
// See: https://letsencrypt.org/docs/certificates-for-localhost/
const createHttpsAgent = () => {
  // Only bypass SSL in development or when explicitly set
  const bypassSSL = process.env.NODE_ENV === 'development' || 
                    process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0';
  
  return new https.Agent({
    rejectUnauthorized: !bypassSSL,
  });
};

// Enhanced fetch wrapper with better error handling and retry logic
export async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // For Node.js environments (build time), we might need to handle SSL differently
      const fetchOptions: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };
      
      // Only add agent in Node.js environments (not in browser)
      if (typeof window === 'undefined' && url.startsWith('https:')) {
        // @ts-ignore - agent property exists in Node.js RequestInit
        fetchOptions.agent = createHttpsAgent();
      }
      
      const response = await fetch(url, fetchOptions);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.text().catch(() => 'Unknown error');
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          url,
          errorData
        );
      }
      
      return response;
    } catch (error: unknown) {
      const isLastAttempt = attempt === maxRetries;
      
      // Log specific SSL certificate errors with helpful context
      const errorWithCause = error as { cause?: { code?: string } };
      if (errorWithCause?.cause?.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
        console.warn(`SSL certificate issue with ${url} (attempt ${attempt}/${maxRetries}). This may be due to misconfigured certificates on the API server.`);
        console.warn('See: https://letsencrypt.org/docs/certificates-for-localhost/');
        
        if (isLastAttempt) {
          console.error('All SSL retry attempts failed. Consider setting NODE_TLS_REJECT_UNAUTHORIZED=0 for development.');
        }
      } else if (error instanceof APIError) {
        console.error(`API Error (attempt ${attempt}/${maxRetries}):`, error.message);
      } else {
        console.warn(`Network error (attempt ${attempt}/${maxRetries}) for ${url}:`, error);
      }
      
      if (isLastAttempt) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Custom API Error class for better error handling
export class APIError extends Error {
  public readonly status: number;
  public readonly url: string;
  public readonly responseBody: string;
  
  constructor(message: string, status: number, url: string, responseBody: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.url = url;
    this.responseBody = responseBody;
  }
}

// Helper function to parse JSON with better error handling
export async function parseJSONResponse<T>(response: Response): Promise<T> {
  try {
    return await response.json();
  } catch (error) {
    throw new APIError(
      'Failed to parse JSON response',
      response.status,
      response.url,
      await response.text().catch(() => 'Unable to read response body')
    );
  }
}

// API base URLs
export const API_BASE_URL = 'https://api.langaracourses.ca';
export const API_V1_BASE = `${API_BASE_URL}/v1`;
export const API_V2_BASE = `${API_BASE_URL}/v2`;

// Common API endpoints
export const ENDPOINTS = {
  courses: {
    index: `${API_V1_BASE}/index/courses`,
    detail: (subject: string, code: string) => `${API_V1_BASE}/courses/${subject}/${code}`,
    search: `${API_V2_BASE}/search/courses`,
  },
  transfers: {
    index: `${API_V1_BASE}/index/transfer_destinations`,
  },
  subjects: {
    index: `${API_V1_BASE}/index/subjects`,
  },
};
