/**
 * 📋 Task Management System
 * Handles task submission, validation, queuing, and processing
 */

import { db } from './firebase';
import { collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'crypto';
import { captureException } from './sentry';

export type TaskType = 
  | 'ai_generation'
  | 'dm_reply'
  | 'money_play'
  | 'image_generation'
  | 'video_generation'
  | 'email_sequence'
  | 'automation'
  | 'report_generation';

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface TaskInput {
  type: TaskType;
  userId: string;
  tier: 'free' | 'starter' | 'creator' | 'pro' | 'agency' | 'education';
  payload: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
  metadata?: {
    source?: string;
    tags?: string[];
    retryCount?: number;
    maxRetries?: number;
  };
}

export interface Task extends TaskInput {
  id: string;
  status: TaskStatus;
  result?: Record<string, any>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  estimatedDuration?: number;
}

export interface TaskQueue {
  id: string;
  userId: string;
  tasks: string[]; // task IDs
  processing: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Submit a task for processing
 */
export async function submitTask(input: TaskInput): Promise<Task> {
  if (!db) throw new Error('Database not initialized');

  try {
    // Validate tier-based limits
    await validateTaskLimits(input.userId, input.type, input.tier);

    // Create task document
    const taskData = {
      ...input,
      id: uuidv4(),
      status: 'pending' as TaskStatus,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      priority: input.priority || 'medium',
    };

    // Save to Firestore
    const tasksRef = collection(db, 'tasks');
    const docRef = await addDoc(tasksRef, taskData);

    // Add to user's task queue
    await addToTaskQueue(input.userId, docRef.id);

    // Trigger processing (async)
    processTaskAsync(docRef.id).catch(err => {
      console.error('Task processing error:', err);
      captureException(err, 'task_processing_error');
    });

    return {
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: docRef.id,
    };
  } catch (error) {
    captureException(error, 'task_submission_error');
    throw error;
  }
}

/**
 * Validate task submission against tier limits
 */
async function validateTaskLimits(
  userId: string,
  taskType: TaskType,
  tier: string
): Promise<void> {
  // Define daily limits per tier
  const limits: Record<string, Record<TaskType, number>> = {
    free: {
      ai_generation: 5,
      dm_reply: 3,
      money_play: 1,
      image_generation: 2,
      video_generation: 0,
      email_sequence: 0,
      automation: 0,
      report_generation: 1,
    },
    starter: {
      ai_generation: 50,
      dm_reply: 20,
      money_play: 5,
      image_generation: 10,
      video_generation: 2,
      email_sequence: 5,
      automation: 2,
      report_generation: 5,
    },
    creator: {
      ai_generation: 500,
      dm_reply: 100,
      money_play: -1, // unlimited
      image_generation: 50,
      video_generation: 10,
      email_sequence: 20,
      automation: 10,
      report_generation: 20,
    },
    pro: {
      ai_generation: -1, // unlimited
      dm_reply: -1,
      money_play: -1,
      image_generation: -1,
      video_generation: -1,
      email_generation: -1,
      automation: -1,
      report_generation: -1,
    },
    agency: {
      ai_generation: -1,
      dm_reply: -1,
      money_play: -1,
      image_generation: -1,
      video_generation: -1,
      email_generation: -1,
      automation: -1,
      report_generation: -1,
    },
    education: {
      ai_generation: -1,
      dm_reply: -1,
      money_play: -1,
      image_generation: 500,
      video_generation: -1,
      email_generation: -1,
      automation: -1,
      report_generation: -1,
    },
  };

  const tierLimits = limits[tier] || limits.free;
  const limit = tierLimits[taskType];

  // If limit is -1, unlimited tasks allowed
  if (limit === -1) return;

  // Check today's task count
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!db) throw new Error('Database not initialized');

  const tasksRef = collection(db, 'tasks');
  const q = query(
    tasksRef,
    where('userId', '==', userId),
    where('type', '==', taskType),
    where('createdAt', '>=', Timestamp.fromDate(today))
  );

  const snapshot = await getDocs(q);
  const count = snapshot.size;

  if (count >= limit) {
    throw new Error(`Daily limit reached for ${taskType} (${count}/${limit})`);
  }
}

/**
 * Add task to user's queue
 */
async function addToTaskQueue(userId: string, taskId: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  const queueRef = doc(db, 'userQueues', userId);
  const queueDoc = await getDoc(queueRef);

  if (queueDoc.exists()) {
    await updateDoc(queueRef, {
      tasks: [...(queueDoc.data().tasks || []), taskId],
      updatedAt: Timestamp.now(),
    });
  } else {
    await addDoc(collection(db, 'userQueues'), {
      userId,
      tasks: [taskId],
      processing: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }
}

/**
 * Get task status
 */
export async function getTaskStatus(taskId: string): Promise<Task | null> {
  if (!db) throw new Error('Database not initialized');

  const taskRef = doc(db, 'tasks', taskId);
  const taskDoc = await getDoc(taskRef);

  if (!taskDoc.exists()) return null;

  const data = taskDoc.data();
  return {
    ...data,
    id: taskDoc.id,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    completedAt: data.completedAt?.toDate(),
  } as Task;
}

/**
 * Get user's task history
 */
export async function getUserTasks(
  userId: string,
  status?: TaskStatus,
  limit: number = 20
): Promise<Task[]> {
  if (!db) throw new Error('Database not initialized');

  const tasksRef = collection(db, 'tasks');
  let q;

  if (status) {
    q = query(
      tasksRef,
      where('userId', '==', userId),
      where('status', '==', status)
    );
  } else {
    q = query(tasksRef, where('userId', '==', userId));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.slice(0, limit).map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      completedAt: data.completedAt?.toDate(),
    } as Task;
  });
}

/**
 * Process task asynchronously
 */
async function processTaskAsync(taskId: string): Promise<void> {
  try {
    const task = await getTaskStatus(taskId);
    if (!task) throw new Error('Task not found');

    // Update status to processing
    await updateTaskStatus(taskId, 'processing');

    // Process based on task type
    const result = await processTaskByType(task);

    // Mark as completed
    await updateTaskStatus(taskId, 'completed', result);
  } catch (error) {
    console.error(`Task ${taskId} failed:`, error);
    await updateTaskStatus(taskId, 'failed', undefined, error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Process task based on type
 */
async function processTaskByType(task: Task): Promise<Record<string, any>> {
  switch (task.type) {
    case 'ai_generation':
      return await processAIGeneration(task);
    case 'dm_reply':
      return await processDMReply(task);
    case 'money_play':
      return await processMoneyPlay(task);
    case 'image_generation':
      return await processImageGeneration(task);
    case 'automation':
      return await processAutomation(task);
    default:
      throw new Error(`Unknown task type: ${task.type}`);
  }
}

/**
 * Process AI generation task
 */
async function processAIGeneration(task: Task): Promise<Record<string, any>> {
  const { content, description, tone, niche } = task.payload;
  const generatedContent = content || `Generated content for ${niche || 'your audience'}`;
  // Integration with actual AI generation would go here
  return {
    content: generatedContent,
    summary: description ?? 'AI generated summary',
    tone: tone ?? 'neutral',
    status: 'success',
    processingTime: Date.now() - task.createdAt.getTime(),
  };
}

/**
 * Process DM reply task
 */
async function processDMReply(task: Task): Promise<Record<string, any>> {
  const { message, context } = task.payload;
  // Integration with DM reply system
  return {
    reply: `Auto-reply to: ${message}`,
    context: context ?? 'general',
    status: 'success',
  };
}

/**
 * Process money play task
 */
async function processMoneyPlay(task: Task): Promise<Record<string, any>> {
  const { description, goal } = task.payload;
  // Money play generation logic
  return {
    moneyPlay: description || 'AI-generated money play',
    goal: goal || 'grow revenue',
    status: 'success',
  };
}

/**
 * Process image generation task
 */
async function processImageGeneration(task: Task): Promise<Record<string, any>> {
  const { prompt, style } = task.payload;
  // Image generation logic (DALL-E, Midjourney, etc.)
  return {
    imageUrl: `https://example.com/images/${Date.now()}.jpg`,
    prompt,
    style: style || 'default',
    status: 'success',
  };
}

/**
 * Process automation task
 */
async function processAutomation(task: Task): Promise<Record<string, any>> {
  const { automationType } = task.payload;
  // Automation execution logic
  return {
    automationId: `auto_${Date.now()}`,
    automationType: automationType || 'workflow',
    status: 'activated',
  };
}

/**
 * Update task status
 */
async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  result?: Record<string, any>,
  error?: string
): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  const taskRef = doc(db, 'tasks', taskId);
  const updateData: Record<string, any> = {
    status,
    updatedAt: Timestamp.now(),
  };

  if (result) updateData.result = result;
  if (error) updateData.error = error;
  if (status === 'completed') updateData.completedAt = Timestamp.now();

  await updateDoc(taskRef, updateData);
}

/**
 * Cancel task
 */
export async function cancelTask(taskId: string): Promise<void> {
  const task = await getTaskStatus(taskId);
  if (!task) throw new Error('Task not found');
  if (task.status === 'completed' || task.status === 'failed') {
    throw new Error(`Cannot cancel ${task.status} task`);
  }

  await updateTaskStatus(taskId, 'cancelled');
}

/**
 * Retry failed task
 */
export async function retryTask(taskId: string): Promise<void> {
  const task = await getTaskStatus(taskId);
  if (!task) throw new Error('Task not found');
  if (task.status !== 'failed') {
    throw new Error('Can only retry failed tasks');
  }

  // Resubmit as new task
  const newInput: TaskInput = {
    type: task.type,
    userId: task.userId,
    tier: task.tier,
    payload: task.payload,
    priority: task.priority,
    metadata: {
      ...task.metadata,
      retryCount: (task.metadata?.retryCount || 0) + 1,
    },
  };

  await submitTask(newInput);
  await updateTaskStatus(taskId, 'cancelled');
}

export default {
  submitTask,
  getTaskStatus,
  getUserTasks,
  cancelTask,
  retryTask,
  validateTaskLimits,
};
