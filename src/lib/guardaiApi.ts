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
