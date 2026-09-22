"""Pydantic schemas for GuardAI infrastructure payloads."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


NodeStatus = Literal["healthy", "warning", "critical"]


class Node(BaseModel):
    """A single infrastructure node shown in the digital twin."""

    id: str
    name: str
    x: int
    y: int
    status: NodeStatus
    cpu: int
    ram: int
    temp: int
    disk: int
    power: int
    risk: int
    aiRecommendation: str
    cluster: str


class Connection(BaseModel):
    """A directed display connection between two nodes."""

    source: str
    target: str


class TopologyResponse(BaseModel):
    """Topology snapshot rendered by the digital twin screen."""

    project: str = "GuardAI"
    status: str = "running"
    version: str = "1.0.0"
    updated_at: datetime
    nodes: list[Node]
    connections: list[Connection]


class ActionMessage(BaseModel):
    """Shared response structure for backend actions."""

    project: str = "GuardAI"
    status: str = "running"
    version: str = "1.0.0"
    action: str
    message: str
    timestamp: datetime


class ScanResponse(ActionMessage):
    """Response for the run-scan action."""

    critical_nodes: list[str] = Field(default_factory=list)
    warning_nodes: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    topology: TopologyResponse


class PatchResponse(ActionMessage):
    """Response for the deploy-patch action."""

    affected_nodes: list[str] = Field(default_factory=list)
    outcome: str


class ReportResponse(ActionMessage):
    """Response for the report generation workflow."""

    title: str
    summary: str
    metrics: dict[str, str]
    sections: list[str] = Field(default_factory=list)


class ExportResponse(ActionMessage):
    """Response for exporting the current view."""

    file_name: str
    content_type: str
    payload: dict[str, object]


class ServerSummary(BaseModel):
    """Summary card for a single server in the fleet view."""

    id: str
    cluster: str
    status: NodeStatus
    cpu: int
    ram: int
    disk: int
    temp: int
    power: int
    risk: int
    uptime: str
    location: str
    ip: str
    ai: str


class ServerCreate(BaseModel):
    """Payload for creating a new fleet server."""

    id: str | None = None
    name: str
    cluster: str
    ip: str
    location: str = "US-East-1a"


class ServerLogsResponse(ActionMessage):
    """Response returned when logs are requested for a server."""

    server_id: str
    log_lines: list[str]


class ServerSSHResponse(ActionMessage):
    """Response returned when SSH access is requested."""

    server_id: str
    connection_string: str
    note: str


class ServerDiagnosisResponse(ActionMessage):
    """Response returned when an AI-style diagnosis is requested."""

    server_id: str
    verdict: str
    recommendation: str
    metrics: dict[str, str]


class ServerDeleteResponse(ActionMessage):
    """Response returned when a server is removed from the fleet."""

    server_id: str
    removed: bool = True


class AlertItem(BaseModel):
    """An infrastructure alert or incident item."""

    id: str
    severity: Literal["critical", "high", "medium", "low"]
    title: str
    desc: str
    server: str
    time: str
    timestamp: str
    status: Literal["active", "acknowledged", "investigating", "monitoring", "resolved"]
    ai: str
    tags: list[str]


class AlertActionRequest(BaseModel):
    """Payload for updating alert status."""

    action: Literal["acknowledge", "investigate", "autofix", "resolve"]


class CopilotQueryRequest(BaseModel):
    """Payload for querying AI Copilot."""

    prompt: str
    context_node: str | None = None


class CopilotQueryResponse(ActionMessage):
    """Response returned by AI Copilot engine."""

    prompt: str
    content: str
    confidence: float
    message_type: Literal["analysis", "recommendation", "alert", "normal"] = "analysis"
    suggested_actions: list[str] = Field(default_factory=list)


