// Azure Integration Service
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

export interface AzureConnection {
  id: string;
  userId: string;
  name: string;
  subscriptionId: string;
  resourceGroup: string;
  storageAccountName: string;
  connectionString: string;
  connected: boolean;
  connectedAt: Date;
  resources: AzureResource[];
}

export interface AzureResource {
  id: string;
  name: string;
  type: 'storage' | 'compute' | 'database' | 'function' | 'vm' | 'web-app';
  region: string;
  status: 'running' | 'stopped' | 'pending';
  resourceGroup: string;
  metadata?: Record<string, unknown>;
}

export interface AzureFile {
  name: string;
  size: number;
  modified: Date;
  type: 'file' | 'directory';
  path: string;
}

/**
 * Connect to Azure Storage
 */
export async function connectAzureStorage(
  connectionString: string
): Promise<BlobServiceClient> {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    // Test connection
    await blobServiceClient.listContainers().next();
    return blobServiceClient;
  } catch (error) {
    console.error('Error connecting to Azure Storage:', error);
    throw new Error('Failed to connect to Azure Storage');
  }
}

/**
 * List Azure containers
 */
export async function listAzureContainers(
  connectionString: string
): Promise<string[]> {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containers: string[] = [];

    for await (const container of blobServiceClient.listContainers()) {
      containers.push(container.name);
    }

    return containers;
  } catch (error) {
    console.error('Error listing containers:', error);
    throw error;
  }
}

/**
 * List files in Azure container
 */
export async function listAzureFiles(
  connectionString: string,
  containerName: string,
  prefix?: string
): Promise<AzureFile[]> {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const files: AzureFile[] = [];

    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
      files.push({
        name: blob.name,
        size: blob.properties.contentLength || 0,
        modified: blob.properties.lastModified || new Date(),
        type: blob.name.endsWith('/') ? 'directory' : 'file',
        path: blob.name,
      });
    }

    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

/**
 * Upload file to Azure
 */
export async function uploadToAzure(
  connectionString: string,
  containerName: string,
  fileName: string,
  fileBuffer: Buffer
): Promise<string> {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.upload(fileBuffer, fileBuffer.length);
    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading to Azure:', error);
    throw error;
  }
}

/**
 * Download file from Azure
 */
export async function downloadFromAzure(
  connectionString: string,
  containerName: string,
  fileName: string
): Promise<Buffer> {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    return Buffer.from(await downloadBlockBlobResponse.blobBody);
  } catch (error) {
    console.error('Error downloading from Azure:', error);
    throw error;
  }
}

/**
 * Delete file from Azure
 */
export async function deleteFromAzure(
  connectionString: string,
  containerName: string,
  fileName: string
): Promise<void> {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.delete();
  } catch (error) {
    console.error('Error deleting from Azure:', error);
    throw error;
  }
}

/**
 * Create Azure container
 */
export async function createAzureContainer(
  connectionString: string,
  containerName: string
): Promise<void> {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists();
  } catch (error) {
    console.error('Error creating container:', error);
    throw error;
  }
}

/**
 * Get Azure resource insights
 */
export async function getResourceInsights(resources: AzureResource[]): Promise<Record<string, unknown>> {
  return {
    totalResources: resources.length,
    byType: resources.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byStatus: resources.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byRegion: resources.reduce((acc, r) => {
      acc[r.region] = (acc[r.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

/**
 * Calculate Azure costs estimate
 */
export function estimateAzureCosts(resources: AzureResource[]): number {
  // Rough estimates (in USD per month)
  const costPerType: Record<string, number> = {
    storage: 0.02, // $0.02 per GB
    compute: 25, // $25 per VM
    database: 50, // $50 per DB
    function: 0.20, // $0.20 per million executions (rough)
    vm: 50, // $50 per VM
    'web-app': 30, // $30 per tier
  };

  return resources.reduce((total, resource) => {
    return total + (costPerType[resource.type] || 0);
  }, 0);
}
