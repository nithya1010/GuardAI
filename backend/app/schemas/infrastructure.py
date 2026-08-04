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
