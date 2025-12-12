/**
 * 🔄 NATS Consumer System (Optional)
 * Processes tasks from NATS message queue  
 * Install 'nats' package to enable: npm install nats
 * 
 * For now, this system is disabled as NATS is not a required dependency.
 * Tasks will be processed locally instead.
 */

export interface ConsumerMetrics {
  messagesProcessed: number;
  messagesFailed: number;
  averageProcessingTime: number;
  lastProcessed: Date | null;
  lastError: Error | null;
  uptime: Date;
}

class NATSConsumer {
  private static instance: NATSConsumer;
  
  static getInstance(): NATSConsumer {
    if (!NATSConsumer.instance) {
      NATSConsumer.instance = new NATSConsumer();
    }
    return NATSConsumer.instance;
  }
  
  async connect(): Promise<boolean> {
    console.warn('NATS consumer: not configured (NATS package not installed)');
    return false;
  }

  async disconnect(): Promise<void> {
    // no-op
  }

  getMetrics(): ConsumerMetrics {
    return {
      messagesProcessed: 0,
      messagesFailed: 0,
      averageProcessingTime: 0,
      lastProcessed: null,
      lastError: null,
      uptime: new Date(),
    };
  }
}

export default NATSConsumer;
