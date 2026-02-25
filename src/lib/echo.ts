import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { config } from '../config/env';

Pusher.logToConsole = import.meta.env.DEV;

(window as any).Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'reverb',
  key: config.REVERB_APP_KEY,
  wsHost: config.REVERB_HOST,
  wsPort: config.REVERB_PORT,
  wssPort: config.REVERB_PORT,
  forceTLS: config.REVERB_SCHEME === 'https',
  enabledTransports: ['ws', 'wss'],
});

export default echo;
