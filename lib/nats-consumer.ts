/**
 * 🔄 NATS Consumer System
 * Processes tasks from NATS message queue
 * Monitors, logs, and handles errors
 */

import { connect, NatsConnection, Subscription, consumerOpts } from 'nats';
import { getConfig } from './config';
import { captureError, captureMessage } from './sentry';

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
  private connection: NatsConnection | null = null;
  private subscription: Subscription | null = null;
  private metrics: ConsumerMetrics = {
    messagesProcessed: 0,
    messagesFailed: 0,
    averageProcessingTime: 0,
    lastProcessed: null,
    lastError: null,
    uptime: new Date(),
  };
  private isRunning = false;
  private processingTimes: number[] = [];

  /**
   * Singleton pattern
   */
  static getInstance(): NATSConsumer {
    if (!NATSConsumer.instance) {
      NATSConsumer.instance = new NATSConsumer();
    }
    return NATSConsumer.instance;
  }

  /**
   * Initialize NATS connection
   */
  async initialize(): Promise<void> {
    try {
      const config = getConfig();

      if (!config.messaging.nats.url) {
        console.warn('⚠️  NATS not configured, skipping consumer initialization');
        return;
      }

      this.connection = await connect({
        servers: config.messaging.nats.url,
        user: config.messaging.nats.user,
        pass: config.messaging.nats.password,
        timeout: 10000,
      });

      console.log('✅ NATS connected');

      // Create jetstream context
      const nc = this.connection;
      const jsm = await nc.jetstreamManager();

      // Ensure stream exists
      try {
        await jsm.streams.info('LITLABS');
      } catch {
        // Create stream if it doesn't exist
        await jsm.streams.add({
          name: 'LITLABS',
          subjects: ['tasks.>', 'events.>'],
          discard: 'old',
          max_age: 24 * 60 * 60 * 1000000000, // 24 hours in nanoseconds
          retention: 'limits',
        });
        console.log('✅ Created NATS stream: LITLABS');
      }

      captureMessage('NATS consumer initialized', 'info');
    } catch (error) {
      console.error('NATS initialization failed:', error);
      captureException(error, 'nats_init_error');
      throw error;
    }
  }

  /**
   * Start consuming tasks
   */
  async startConsuming(): Promise<void> {
    if (this.isRunning) {
      console.warn('NATS consumer already running');
      return;
    }

    if (!this.connection) {
      await this.initialize();
    }

    try {
      const nc = this.connection;
      if (!nc) throw new Error('NATS connection not established');

      const js = nc.jetstream();

      // Create consumer
      const opts = consumerOpts();
      opts.durable('litlabs-task-consumer');
      opts.manualAck();
      opts.ackWait(30 * 1000); // 30 seconds
      opts.maxDeliver(3);

      // Subscribe to tasks
      this.subscription = await js.subscribe('tasks.>', opts);

      this.isRunning = true;
      console.log('✅ NATS consumer started');

      // Process messages
      (async () => {
        for await (const msg of this.subscription!) {
          const startTime = Date.now();
          try {
            await this.processMessage(msg);
            msg.ack();

            const duration = Date.now() - startTime;
            this.recordMetrics(duration, true);
            this.metrics.lastProcessed = new Date();
          } catch (error) {
            console.error('Message processing error:', error);
            this.recordMetrics(Date.now() - startTime, false, error as Error);

            // Requeue on error
            msg.nak();
          }
        }
      })().catch(err => {
        console.error('NATS subscription error:', err);
        captureException(err, 'nats_subscription_error');
      });

      captureMessage('NATS consumer started consuming', 'info');
    } catch (error) {
      console.error('Failed to start consuming:', error);
      captureException(error, 'nats_start_consuming_error');
      throw error;
    }
  }

  /**
   * Process individual message
   */
  private async processMessage(msg: any): Promise<void> {
    try {
      const data = JSON.parse(new TextDecoder().decode(msg.data));

      // Route message to appropriate handler
      if (msg.subject.startsWith('tasks.')) {
        await this.handleTaskMessage(data);
      } else if (msg.subject.startsWith('events.')) {
        await this.handleEventMessage(data);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  /**
   * Handle task message
   */
  private async handleTaskMessage(data: any): Promise<void> {
    const { taskId, type, userId, payload } = data;

    console.log(`📋 Processing task ${taskId} (${type})`);

    // Dispatch to appropriate handler
    switch (type) {
      case 'ai_generation':
        await this.handleAIGeneration(taskId, userId, payload);
        break;
      case 'email_sequence':
        await this.handleEmailSequence(taskId, userId, payload);
        break;
      case 'automation':
        await this.handleAutomation(taskId, userId, payload);
        break;
      default:
        console.warn(`Unknown task type: ${type}`);
    }
  }

  /**
   * Handle event message
   */
  private async handleEventMessage(data: any): Promise<void> {
    const { eventType, userId, eventData } = data;
    console.log(`📢 Processing event ${eventType} for user ${userId}`);
    // Handle events (webhooks, notifications, etc.)
  }

  /**
   * Handle AI generation task
   */
  private async handleAIGeneration(taskId: string, userId: string, payload: any): Promise<void> {
    // Actual implementation would call AI generation service
    console.log(`Generating AI content for task ${taskId}`);
    // await generateContent(payload);
  }

  /**
   * Handle email sequence task
   */
  private async handleEmailSequence(taskId: string, userId: string, payload: any): Promise<void> {
    console.log(`Sending email sequence for task ${taskId}`);
    // await sendEmailSequence(userId, payload);
  }

  /**
   * Handle automation task
   */
  private async handleAutomation(taskId: string, userId: string, payload: any): Promise<void> {
    console.log(`Executing automation ${taskId}`);
    // await executeAutomation(userId, payload);
  }

  /**
   * Record processing metrics
   */
  private recordMetrics(duration: number, success: boolean, error?: Error): void {
    if (success) {
      this.metrics.messagesProcessed++;
      this.processingTimes.push(duration);

      // Keep only last 100 processing times for average
      if (this.processingTimes.length > 100) {
        this.processingTimes.shift();
      }

      this.metrics.averageProcessingTime =
        this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
    } else {
      this.metrics.messagesFailed++;
      if (error) {
        this.metrics.lastError = error;
      }
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): ConsumerMetrics {
    return { ...this.metrics };
  }

  /**
   * Log metrics
   */
  logMetrics(): void {
    console.log('\n📊 NATS CONSUMER METRICS');
    console.log('========================\n');
    console.log(`✅ Messages Processed: ${this.metrics.messagesProcessed}`);
    console.log(`❌ Messages Failed: ${this.metrics.messagesFailed}`);
    console.log(`⏱️  Avg Processing Time: ${Math.round(this.metrics.averageProcessingTime)}ms`);
    console.log(`📅 Last Processed: ${this.metrics.lastProcessed || 'Never'}`);
    console.log(`🔥 Uptime: ${Math.round((Date.now() - this.metrics.uptime.getTime()) / 1000)}s`);
    if (this.metrics.lastError) {
      console.log(`⚠️  Last Error: ${this.metrics.lastError.message}`);
    }
    console.log('\n========================\n');
  }

  /**
   * Publish task to NATS
   */
  async publishTask(taskId: string, type: string, userId: string, payload: any): Promise<void> {
    if (!this.connection) {
      throw new Error('NATS not initialized');
    }

    const js = this.connection.jetstream();
    const data = JSON.stringify({ taskId, type, userId, payload });

    await js.publish(`tasks.${type}`, new TextEncoder().encode(data));
    console.log(`✅ Published task to NATS: ${taskId}`);
  }

  /**
   * Stop consuming
   */
  async stop(): Promise<void> {
    if (this.subscription) {
      await this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }

    this.isRunning = false;
    console.log('⛔ NATS consumer stopped');
  }

  /**
   * Health check
   */
  isHealthy(): boolean {
    return this.isRunning && this.connection !== null;
  }
}

// Export singleton
export const Consumer = NATSConsumer.getInstance();

/**
 * Initialize consumer
 */
export async function initializeNATSConsumer(): Promise<void> {
  await Consumer.initialize();
  await Consumer.startConsuming();
}

export default Consumer;
