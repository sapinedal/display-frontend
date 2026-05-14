import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { config } from '../config/env';

// Activar logs de Pusher para depuración
Pusher.logToConsole = true;

// Pusher-js es requerido internamente por laravel-echo para Reverb
(window as any).Pusher = Pusher;

console.log('[Echo] Conectando a Reverb:', {
  key: config.REVERB_APP_KEY,
  host: config.REVERB_HOST,
  port: config.REVERB_PORT,
  tls: config.REVERB_SCHEME === 'https',
});

const echo = new Echo({
  broadcaster: 'reverb',
  key: config.REVERB_APP_KEY,
  wsHost: config.REVERB_HOST,
  wsPort: config.REVERB_PORT,
  wssPort: config.REVERB_PORT,
  forceTLS: config.REVERB_SCHEME === 'https',
  enabledTransports: ['ws', 'wss'],
});

// Logs de estado de conexión
echo.connector.pusher.connection.bind('connected', () => {
  console.log('[Echo] ✅ Conectado al servidor WebSocket');
});
echo.connector.pusher.connection.bind('disconnected', () => {
  console.warn('[Echo] ❌ Desconectado del servidor WebSocket');
});
echo.connector.pusher.connection.bind('error', (err: any) => {
  console.error('[Echo] 🔴 Error de conexión:', err);
});
echo.connector.pusher.connection.bind('state_change', (states: any) => {
  console.log(`[Echo] Estado: ${states.previous} → ${states.current}`);
});

export default echo;
