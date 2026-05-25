import type { PlatformClient } from '@nimiplatform/sdk';
import type {
  RouteConnector,
  RouteConnectorModel,
  RouteLocalModel,
  RouteModelPickerDataProvider,
} from '@nimiplatform/kit/features/model-picker';
import { getRuntimePlatformProjection } from '../shell/auth/runtime-platform.js';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => text(item)).filter(Boolean)
    : [];
}

async function requireRuntimeClient(): Promise<PlatformClient> {
  const projection = await getRuntimePlatformProjection();
  if (projection.status !== 'ready') {
    throw new Error(projection.message || 'Runtime is unavailable; model catalog failed closed.');
  }
  return projection.client;
}

function statusName(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return 'unknown';
}

function normalizeConnector(value: unknown): RouteConnector | null {
  const record = asRecord(value);
  const connectorId = text(record.connectorId) || text(record.connector_id) || text(record.id);
  if (!connectorId) return null;
  const provider = text(record.provider) || connectorId;
  return {
    connectorId,
    provider,
    label: text(record.label) || provider,
    status: statusName(record.status),
  };
}

function normalizeConnectorModel(value: unknown, capability: string): RouteConnectorModel | null {
  const record = asRecord(value);
  const modelId = text(record.modelId) || text(record.model_id) || text(record.id) || text(record.model);
  if (!modelId) return null;
  const capabilities = stringList(record.capabilities);
  if (capability && capabilities.length > 0 && !capabilities.includes(capability)) {
    return null;
  }
  return {
    modelId,
    modelLabel: text(record.modelLabel) || text(record.model_label) || text(record.label) || modelId,
    available: typeof record.available === 'boolean' ? record.available : true,
    capabilities,
  };
}

async function listAllConnectors(client: PlatformClient): Promise<RouteConnector[]> {
  const connectors: RouteConnector[] = [];
  let pageToken = '';
  do {
    const response = await client.domains.runtimeAdmin.listConnectors({
      pageSize: 200,
      pageToken,
    });
    const records = Array.isArray(response.connectors) ? response.connectors : [];
    for (const connector of records) {
      const normalized = normalizeConnector(connector);
      if (normalized) connectors.push(normalized);
    }
    pageToken = text(response.nextPageToken);
  } while (pageToken);
  return connectors;
}

async function listAllConnectorModels(
  client: PlatformClient,
  connectorId: string,
  capability: string,
): Promise<RouteConnectorModel[]> {
  const models: RouteConnectorModel[] = [];
  let pageToken = '';
  do {
    const response = await client.domains.runtimeAdmin.listConnectorModels({
      connectorId,
      forceRefresh: false,
      pageSize: 200,
      pageToken,
    });
    const records = Array.isArray(response.models) ? response.models : [];
    for (const model of records) {
      const normalized = normalizeConnectorModel(model, capability);
      if (normalized) models.push(normalized);
    }
    pageToken = text(response.nextPageToken);
  } while (pageToken);
  return models;
}

export function createTesterRuntimeModelPickerProvider(capability: string): RouteModelPickerDataProvider {
  let connectorCache: RouteConnector[] | null = null;
  const modelCache = new Map<string, RouteConnectorModel[]>();

  return {
    async listLocalModels(): Promise<RouteLocalModel[]> {
      await requireRuntimeClient();
      return [];
    },
    async listConnectors(): Promise<RouteConnector[]> {
      if (connectorCache) return connectorCache;
      const client = await requireRuntimeClient();
      connectorCache = await listAllConnectors(client);
      return connectorCache;
    },
    async listConnectorModels(connectorId: string): Promise<RouteConnectorModel[]> {
      const normalizedConnectorId = text(connectorId);
      if (!normalizedConnectorId) return [];
      const cached = modelCache.get(normalizedConnectorId);
      if (cached) return cached;
      const client = await requireRuntimeClient();
      const models = await listAllConnectorModels(client, normalizedConnectorId, capability);
      modelCache.set(normalizedConnectorId, models);
      return models;
    },
    invalidate() {
      connectorCache = null;
      modelCache.clear();
    },
  };
}
