export const config = {
  API_URL: import.meta.env.VITE_API_URL,
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Fluent',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  REVERB_APP_KEY: import.meta.env.VITE_REVERB_APP_KEY || 'my-app-key',
  REVERB_HOST: import.meta.env.VITE_REVERB_HOST || 'localhost',
  REVERB_PORT: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
  REVERB_SCHEME: import.meta.env.VITE_REVERB_SCHEME || 'http',
}; 