/**
 * Application configuration
 * 
 * This file abstracts all environment variables into a typed configuration object
 * Always access environment variables through this config instead of directly
 */

export const config = {
  api: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
  auth: {
    domain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || '',
    clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID || '',
    audience: process.env.NEXT_PUBLIC_AUTH_AUDIENCE || '',
  },
  maps: {
    apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY || '',
  },
  features: {
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  },
};

/**
 * Validates that all required environment variables are set
 * @returns boolean indicating if config is valid
 */
export const validateConfig = (): boolean => {
  const requiredVars = [
    'NEXT_PUBLIC_API_URL',
    // Uncomment when auth is implemented
    // 'NEXT_PUBLIC_AUTH_DOMAIN',
    // 'NEXT_PUBLIC_AUTH_CLIENT_ID',
    // 'NEXT_PUBLIC_AUTH_AUDIENCE',
    // Uncomment when maps integration is implemented
    // 'NEXT_PUBLIC_MAPS_API_KEY',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
}; 