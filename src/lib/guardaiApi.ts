export type NodeStatus = 'healthy' | 'warning' | 'critical'

export interface GuardAINode {
  id: string
  name: string
  x: number
  y: number
  status: NodeStatus
  cpu: number
  ram: number
  temp: number
  disk: number
  power: number
  risk: number
  aiRecommendation: string
  cluster: string
}

export interface GuardAIConnection {
  source: string
  target: string
}

export interface GuardAITopology {
  project: 'GuardAI'
  status: 'running'
  version: string
  updated_at: string
  nodes: GuardAINode[]
  connections: GuardAIConnection[]
}

export interface GuardAIActionResponse {
  project: 'GuardAI'
  status: 'running'
  version: string
  action: string
  message: string
  timestamp: string
}

export interface GuardAIScanResponse extends GuardAIActionResponse {
  critical_nodes: string[]
  warning_nodes: string[]
  recommendations: string[]
  topology: GuardAITopology
}

export interface GuardAIReportResponse extends GuardAIActionResponse {
  title: string
  summary: string
  metrics: Record<string, string>
  sections: string[]
}

export interface GuardAIPatchResponse extends GuardAIActionResponse {
  affected_nodes: string[]
  outcome: string
}

export interface GuardAIExportResponse extends GuardAIActionResponse {
  file_name: string
  content_type: string
  payload: Record<string, unknown>
}

export interface GuardAIServer {
  id: string
  cluster: string
  status: NodeStatus
  cpu: number
  ram: number
  disk: number
  temp: number
  power: number
  risk: number
  uptime: string
  location: string
  ip: string
  ai: string
}

export interface GuardAIServerCreate {
  id?: string
  name: string
  cluster: string
  ip: string
  location?: string
}

export interface GuardAIServerLogsResponse extends GuardAIActionResponse {
  server_id: string
  log_lines: string[]
}

export interface GuardAIServerSSHResponse extends GuardAIActionResponse {
  server_id: string
  connection_string: string
  note: string
}

export interface GuardAIServerDiagnosisResponse extends GuardAIActionResponse {
  server_id: string
  verdict: string
  recommendation: string
  metrics: Record<string, string>
}

export interface GuardAIServerDeleteResponse extends GuardAIActionResponse {
  server_id: string
  removed: boolean
}

const BACKEND_URL = (import.meta.env.VITE_GUARDAI_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    throw new Error(`GuardAI backend request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export async function loadTopology(): Promise<GuardAITopology> {
  return request<GuardAITopology>('/topology')
}

export async function runInfrastructureScan(): Promise<GuardAIScanResponse> {
  return request<GuardAIScanResponse>('/actions/scan', { method: 'POST' })
}

export async function generateExecutiveReport(): Promise<GuardAIReportResponse> {
  return request<GuardAIReportResponse>('/reports/latest')
}

export async function deployInfrastructurePatch(): Promise<GuardAIPatchResponse> {
  return request<GuardAIPatchResponse>('/actions/patch', { method: 'POST' })
}

export async function exportDigitalTwinView(): Promise<GuardAIExportResponse> {
  return request<GuardAIExportResponse>('/export/view')
}

export async function listServers(params?: { cluster?: string; status?: string; query?: string }): Promise<GuardAIServer[]> {
  const searchParams = new URLSearchParams()
  if (params?.cluster) searchParams.set('cluster', params.cluster)
  if (params?.status) searchParams.set('status', params.status)
  if (params?.query) searchParams.set('query', params.query)
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : ''
  return request<GuardAIServer[]>(`/servers${suffix}`)
}

export async function createServer(payload: GuardAIServerCreate): Promise<GuardAIServer> {
  return request<GuardAIServer>('/servers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchServerLogs(serverId: string): Promise<GuardAIServerLogsResponse> {
  return request<GuardAIServerLogsResponse>(`/servers/${encodeURIComponent(serverId)}/logs`)
}

export async function connectToServer(serverId: string): Promise<GuardAIServerSSHResponse> {
  return request<GuardAIServerSSHResponse>(`/servers/${encodeURIComponent(serverId)}/ssh`, { method: 'POST' })
}

export async function diagnoseServer(serverId: string): Promise<GuardAIServerDiagnosisResponse> {
  return request<GuardAIServerDiagnosisResponse>(`/servers/${encodeURIComponent(serverId)}/diagnose`, { method: 'POST' })
}

export async function deleteServer(serverId: string): Promise<GuardAIServerDeleteResponse> {
  return request<GuardAIServerDeleteResponse>(`/servers/${encodeURIComponent(serverId)}`, { method: 'DELETE' })
}

export interface GuardAIAlertItem {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  desc: string
  server: string
  time: string
  timestamp: string
  status: 'active' | 'acknowledged' | 'investigating' | 'monitoring' | 'resolved'
  ai: string
  tags: string[]
}

export interface GuardAICopilotResponse extends GuardAIActionResponse {
  prompt: string
  content: string
  confidence: number
  message_type: 'analysis' | 'recommendation' | 'alert' | 'normal'
  suggested_actions?: string[]
}

export async function fetchAlerts(): Promise<GuardAIAlertItem[]> {
  return request<GuardAIAlertItem[]>('/alerts')
}

export async function updateAlertAction(alertId: string, action: 'acknowledge' | 'investigate' | 'autofix' | 'resolve'): Promise<GuardAIAlertItem> {
  return request<GuardAIAlertItem>(`/alerts/${encodeURIComponent(alertId)}/action`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  })
}

export async function queryCopilotApi(prompt: string): Promise<GuardAICopilotResponse> {
  return request<GuardAICopilotResponse>('/copilot/query', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  })
}

export function downloadCsv(data: string, fileName: string): void {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function downloadJson(payload: Record<string, unknown>, fileName: string): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

