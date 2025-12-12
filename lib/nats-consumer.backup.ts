/**
 * 🔄 NATS Consumer System
 * Processes tasks from NATS message queue
 * Monitors, logs, and handles errors
 * 
 * NOTE: NATS is optional - install 'nats' package to enable queue processing
 */

import { getConfig } from './config';
import { captureError, captureMessage } from './sentry';

// NATS types (will be imported if available)
type NatsConnection = any;
type Subscription = any;

