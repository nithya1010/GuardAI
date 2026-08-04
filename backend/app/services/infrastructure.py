"""Infrastructure snapshot and action services for GuardAI.

The backend stays deterministic and side-effect free so the frontend can
depend on predictable payloads without requiring a database or AI runtime.
"""

from __future__ import annotations

from collections import Counter
from datetime import UTC, datetime

from app.schemas.infrastructure import Connection, ExportResponse, Node, PatchResponse, ReportResponse, ScanResponse, TopologyResponse


_NODES: list[Node] = [
    Node(id="web-01", name="WEB-PROD-01", x=120, y=100, status="healthy", cpu=23, ram=41, temp=52, disk=67, power=340, risk=8, aiRecommendation="Operating within optimal parameters.", cluster="Web"),
    Node(id="web-02", name="WEB-PROD-02", x=190, y=80, status="healthy", cpu=31, ram=58, temp=56, disk=43, power=370, risk=12, aiRecommendation="Minor RAM growth trend. Monitor over 24h.", cluster="Web"),
    Node(id="web-03", name="WEB-PROD-03", x=155, y=140, status="healthy", cpu=19, ram=37, temp=49, disk=55, power=320, risk=6, aiRecommendation="Lowest load in cluster. Consider rebalancing.", cluster="Web"),
    Node(id="db-01", name="DB-MASTER-01", x=350, y=90, status="warning", cpu=78, ram=85, temp=72, disk=82, power=460, risk=67, aiRecommendation="High memory pressure. Recommend query optimization and connection pooling review.", cluster="Database"),
    Node(id="db-02", name="DB-REPLICA-01", x=420, y=130, status="healthy", cpu=34, ram=61, temp=58, disk=71, power=390, risk=21, aiRecommendation="Replication lag within tolerance.", cluster="Database"),
    Node(id="db-03", name="DB-REPLICA-02", x=390, y=170, status="warning", cpu=62, ram=74, temp=68, disk=79, power=430, risk=55, aiRecommendation="I/O wait times elevated. SSD health check recommended.", cluster="Database"),
    Node(id="ai-01", name="GPU-NODE-01", x=580, y=80, status="critical", cpu=96, ram=92, temp=88, disk=94, power=820, risk=91, aiRecommendation="🚨 CRITICAL: Thermal throttling imminent. Immediate cooling intervention required.", cluster="AI/ML"),
    Node(id="ai-02", name="GPU-NODE-02", x=650, y=120, status="warning", cpu=81, ram=79, temp=76, disk=68, power=740, risk=63, aiRecommendation="GPU utilization high. Queue saturation likely within 2h.", cluster="AI/ML"),
    Node(id="ai-03", name="GPU-NODE-03", x=610, y=165, status="healthy", cpu=45, ram=53, temp=61, disk=42, power=560, risk=28, aiRecommendation="Optimal state. Available for additional workloads.", cluster="AI/ML"),
    Node(id="cache-01", name="CACHE-REDIS-01", x=260, y=200, status="healthy", cpu=15, ram=88, temp=44, disk=12, power=180, risk=15, aiRecommendation="High memory usage is expected for cache workload.", cluster="Cache"),
    Node(id="cache-02", name="CACHE-REDIS-02", x=320, y=230, status="healthy", cpu=12, ram=82, temp=42, disk=10, power=170, risk=11, aiRecommendation="Normal operations.", cluster="Cache"),
    Node(id="lb-01", name="LOAD-BAL-01", x=80, y=220, status="healthy", cpu=8, ram=24, temp=38, disk=22, power=120, risk=5, aiRecommendation="Traffic distribution balanced across all upstreams.", cluster="Network"),
    Node(id="lb-02", name="LOAD-BAL-02", x=490, y=240, status="healthy", cpu=11, ram=28, temp=40, disk=25, power=130, risk=7, aiRecommendation="Active-Active configuration healthy.", cluster="Network"),
    Node(id="stor-01", name="STORAGE-01", x=200, y=290, status="warning", cpu=44, ram=55, temp=63, disk=91, power=280, risk=48, aiRecommendation="Disk at 91% capacity. Expand or archive within 72h.", cluster="Storage"),
    Node(id="stor-02", name="STORAGE-02", x=440, y=290, status="healthy", cpu=29, ram=42, temp=51, disk=63, power=260, risk=19, aiRecommendation="Storage metrics nominal.", cluster="Storage"),
]

_CONNECTIONS: list[Connection] = [
    Connection(source="lb-01", target="web-01"), Connection(source="lb-01", target="web-02"), Connection(source="lb-01", target="web-03"),
    Connection(source="web-01", target="db-01"), Connection(source="web-02", target="db-01"), Connection(source="web-03", target="db-02"),
    Connection(source="db-01", target="db-02"), Connection(source="db-01", target="db-03"), Connection(source="db-01", target="cache-01"),
    Connection(source="cache-01", target="cache-02"), Connection(source="cache-02", target="db-02"),
    Connection(source="web-01", target="cache-01"), Connection(source="web-02", target="cache-01"),
    Connection(source="lb-02", target="ai-01"), Connection(source="lb-02", target="ai-02"), Connection(source="lb-02", target="ai-03"),
    Connection(source="ai-01", target="ai-02"), Connection(source="ai-02", target="ai-03"),
    Connection(source="web-01", target="stor-01"), Connection(source="db-01", target="stor-01"), Connection(source="ai-01", target="stor-02"),
    Connection(source="stor-01", target="stor-02"),
]


def _now() -> datetime:
    return datetime.now(UTC)


def _topology() -> TopologyResponse:
    return TopologyResponse(updated_at=_now(), nodes=_NODES, connections=_CONNECTIONS)


def get_topology() -> TopologyResponse:
    """Return the latest deterministic infrastructure topology."""

    return _topology()


def run_scan() -> ScanResponse:
    """Return a deterministic infrastructure scan summary."""

    topology = _topology()
    counts = Counter(node.status for node in topology.nodes)
    return ScanResponse(
        action="run_scan",
        message="Infrastructure scan completed successfully.",
        timestamp=_now(),
        critical_nodes=[node.name for node in topology.nodes if node.status == "critical"],
        warning_nodes=[node.name for node in topology.nodes if node.status == "warning"],
        recommendations=[
            "Intervene on GPU-NODE-01 thermal conditions immediately.",
            "Expand STORAGE-01 capacity within 72 hours.",
            "Review DB-MASTER-01 query pressure and connection pooling.",
        ],
        topology=topology,
    )


def generate_report() -> ReportResponse:
    """Return a stable report payload for the report workflow."""

    topology = _topology()
    counts = Counter(node.status for node in topology.nodes)
    return ReportResponse(
        action="generate_report",
        message="Executive report generated successfully.",
        timestamp=_now(),
        title="GuardAI Executive Health Report",
        summary="Production infrastructure remains stable with targeted remediation required for one critical compute node and storage growth planning.",
        metrics={
            "healthy_nodes": str(counts.get("healthy", 0)),
            "warning_nodes": str(counts.get("warning", 0)),
            "critical_nodes": str(counts.get("critical", 0)),
            "health_score": "97.2",
        },
        sections=[
            "Operational Summary",
            "Critical Risk Review",
            "Recommended Actions",
            "Capacity and Forecast Snapshot",
        ],
    )


def deploy_patch() -> PatchResponse:
    """Return a deterministic patch deployment acknowledgement."""

    return PatchResponse(
        action="deploy_patch",
        message="Patch deployment staged successfully.",
        timestamp=_now(),
        affected_nodes=["GPU-NODE-01", "DB-MASTER-01"],
        outcome="staged_for_approval",
    )


def export_view() -> ExportResponse:
    """Return the current digital twin view as an export payload."""

    topology = _topology()
    return ExportResponse(
        action="export_view",
        message="Digital twin export prepared successfully.",
        timestamp=_now(),
        file_name="guardai-digital-twin.json",
        content_type="application/json",
        payload=topology.model_dump(mode="json"),
    )
