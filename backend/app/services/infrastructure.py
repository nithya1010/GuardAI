"""Infrastructure snapshot and action services for GuardAI.

The backend stays deterministic and side-effect free so the frontend can
depend on predictable payloads without requiring a database or AI runtime.
"""

from __future__ import annotations

from collections import Counter
from datetime import UTC, datetime
import threading

from app.schemas.infrastructure import Connection, ExportResponse, Node, PatchResponse, ReportResponse, ScanResponse, ServerCreate, ServerDeleteResponse, ServerDiagnosisResponse, ServerLogsResponse, ServerSSHResponse, ServerSummary, TopologyResponse


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

_SERVER_LOCK = threading.Lock()
_SERVER_STORE: list[ServerSummary] = [
    ServerSummary(id="WEB-PROD-01", cluster="Web", status="healthy", cpu=23, ram=41, disk=67, temp=52, power=340, risk=8, uptime="99.99%", location="US-East-1a", ip="10.0.1.11", ai="Operating within optimal parameters. No action required."),
    ServerSummary(id="WEB-PROD-02", cluster="Web", status="healthy", cpu=31, ram=58, disk=43, temp=56, power=370, risk=12, uptime="99.97%", location="US-East-1b", ip="10.0.1.12", ai="Minor RAM growth trend. Monitor over next 24h period."),
    ServerSummary(id="WEB-PROD-03", cluster="Web", status="healthy", cpu=19, ram=37, disk=55, temp=49, power=320, risk=6, uptime="100%", location="US-East-1c", ip="10.0.1.13", ai="Lowest load in cluster. Consider redistributing traffic."),
    ServerSummary(id="DB-MASTER-01", cluster="Database", status="warning", cpu=78, ram=85, disk=82, temp=72, power=460, risk=67, uptime="99.89%", location="US-East-1a", ip="10.0.2.10", ai="High memory pressure detected. Recommend query optimization and connection pool review immediately."),
    ServerSummary(id="DB-REPLICA-01", cluster="Database", status="healthy", cpu=34, ram=61, disk=71, temp=58, power=390, risk=21, uptime="99.95%", location="US-East-1b", ip="10.0.2.11", ai="Replication lag within acceptable tolerance. Normal operations."),
    ServerSummary(id="DB-REPLICA-02", cluster="Database", status="warning", cpu=62, ram=74, disk=79, temp=68, power=430, risk=55, uptime="99.91%", location="US-East-1c", ip="10.0.2.12", ai="I/O wait times elevated. SSD health verification recommended within 24h."),
    ServerSummary(id="GPU-NODE-01", cluster="AI/ML", status="critical", cpu=96, ram=92, disk=94, temp=88, power=820, risk=91, uptime="98.12%", location="US-West-2a", ip="10.0.3.10", ai="CRITICAL: Thermal throttling imminent. Immediate cooling intervention required. Risk of hardware failure."),
    ServerSummary(id="GPU-NODE-02", cluster="AI/ML", status="warning", cpu=81, ram=79, disk=68, temp=76, power=740, risk=63, uptime="99.41%", location="US-West-2b", ip="10.0.3.11", ai="GPU utilization critically high. Queue saturation expected within 2h at current trajectory."),
    ServerSummary(id="GPU-NODE-03", cluster="AI/ML", status="healthy", cpu=45, ram=53, disk=42, temp=61, power=560, risk=28, uptime="99.82%", location="US-West-2c", ip="10.0.3.12", ai="Optimal state. Available capacity for additional AI workloads."),
    ServerSummary(id="CACHE-REDIS-01", cluster="Cache", status="healthy", cpu=15, ram=88, disk=12, temp=44, power=180, risk=15, uptime="100%", location="US-East-1a", ip="10.0.4.10", ai="High memory is expected for cache workload. Hit ratio at 98.3% — excellent."),
    ServerSummary(id="CACHE-REDIS-02", cluster="Cache", status="healthy", cpu=12, ram=82, disk=10, temp=42, power=170, risk=11, uptime="100%", location="US-East-1b", ip="10.0.4.11", ai="Normal operations. Standby replication healthy."),
    ServerSummary(id="STORAGE-01", cluster="Storage", status="warning", cpu=44, ram=55, disk=91, temp=63, power=280, risk=48, uptime="99.78%", location="US-East-1a", ip="10.0.5.10", ai="Disk at 91% capacity. Add 4TB volume within 72h to prevent service degradation."),
    ServerSummary(id="STORAGE-02", cluster="Storage", status="healthy", cpu=29, ram=42, disk=63, temp=51, power=260, risk=19, uptime="99.96%", location="US-East-1c", ip="10.0.5.11", ai="Storage metrics nominal. Capacity planning on schedule."),
    ServerSummary(id="LOAD-BAL-01", cluster="Network", status="healthy", cpu=8, ram=24, disk=22, temp=38, power=120, risk=5, uptime="100%", location="US-East-1a", ip="10.0.6.10", ai="Traffic distribution balanced. All upstreams healthy."),
    ServerSummary(id="LOAD-BAL-02", cluster="Network", status="healthy", cpu=11, ram=28, disk=25, temp=40, power=130, risk=7, uptime="100%", location="US-West-2a", ip="10.0.6.11", ai="Active-Active configuration operating correctly."),
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


def list_servers(cluster: str | None = None, status: str | None = None, query: str | None = None) -> list[ServerSummary]:
    """Return the current fleet with optional server-side filtering."""

    normalized_query = (query or '').strip().lower()
    normalized_cluster = (cluster or '').strip().lower()
    normalized_status = (status or '').strip().lower()

    def matches(server: ServerSummary) -> bool:
        if normalized_cluster and normalized_cluster != 'all' and server.cluster.lower() != normalized_cluster:
            return False
        if normalized_status and normalized_status != 'all' and server.status != normalized_status:
            return False
        if normalized_query and normalized_query not in ' '.join([server.id, server.cluster, server.location, server.ip, server.ai]).lower():
            return False
        return True

    with _SERVER_LOCK:
        return [server.model_copy() for server in _SERVER_STORE if matches(server)]


def add_server(server: ServerCreate) -> ServerSummary:
    """Create a new in-memory server entry."""

    server_id = (server.id or server.name).strip().upper().replace(' ', '-')
    derived_risk = min(95, max(5, len(server.name) * 2 + len(server.cluster)))
    status = 'warning' if derived_risk >= 40 else 'healthy'
    new_server = ServerSummary(
        id=server_id,
        cluster=server.cluster,
        status=status,
        cpu=18,
        ram=34,
        disk=26,
        temp=44,
        power=210,
        risk=derived_risk,
        uptime='100%',
        location=server.location,
        ip=server.ip,
        ai='New server registered. Baseline telemetry established.',
    )

    with _SERVER_LOCK:
        _SERVER_STORE.insert(0, new_server)

    return new_server.model_copy()


def get_server_logs(server_id: str) -> ServerLogsResponse:
    """Return deterministic logs for a server."""

    server = _find_server(server_id)
    return ServerLogsResponse(
        action='view_logs',
        message='Logs retrieved successfully.',
        timestamp=_now(),
        server_id=server.id,
        log_lines=[
            f'{server.id} | {server.location} | INFO | Service heartbeat nominal',
            f'{server.id} | {server.location} | INFO | CPU {server.cpu}% RAM {server.ram}% Disk {server.disk}%',
            f'{server.id} | {server.location} | INFO | No unhandled exceptions detected',
        ],
    )


def get_ssh_connection(server_id: str) -> ServerSSHResponse:
    """Return a deterministic SSH connection hint."""

    server = _find_server(server_id)
    return ServerSSHResponse(
        action='ssh_connect',
        message='SSH connection details prepared.',
        timestamp=_now(),
        server_id=server.id,
        connection_string=f'ssh ops@{server.ip}',
        note='Use your organization-approved SSH key or bastion access policy.',
    )


def diagnose_server(server_id: str) -> ServerDiagnosisResponse:
    """Return a deterministic diagnosis payload for the selected server."""

    server = _find_server(server_id)
    verdict = 'critical' if server.status == 'critical' else 'warning' if server.status == 'warning' else 'healthy'
    recommendation = server.ai if server.status != 'healthy' else 'No corrective action required. Continue monitoring.'

    return ServerDiagnosisResponse(
        action='ai_diagnose',
        message='Diagnosis complete.',
        timestamp=_now(),
        server_id=server.id,
        verdict=verdict,
        recommendation=recommendation,
        metrics={
            'cpu': f'{server.cpu}%',
            'ram': f'{server.ram}%',
            'disk': f'{server.disk}%',
            'temp': f'{server.temp}°C',
            'risk': str(server.risk),
        },
    )


def delete_server(server_id: str) -> ServerDeleteResponse:
    """Remove a server from the in-memory fleet."""

    normalized_id = server_id.strip().upper()
    with _SERVER_LOCK:
        for index, server in enumerate(_SERVER_STORE):
            if server.id.upper() == normalized_id:
                removed = _SERVER_STORE.pop(index)
                return ServerDeleteResponse(
                    action='delete_server',
                    message='Server removed successfully.',
                    timestamp=_now(),
                    server_id=removed.id,
                    removed=True,
                )
    raise KeyError(f'Server not found: {server_id}')


def _find_server(server_id: str) -> ServerSummary:
    normalized_id = server_id.strip().upper()
    with _SERVER_LOCK:
        for server in _SERVER_STORE:
            if server.id.upper() == normalized_id:
                return server.model_copy()
    raise KeyError(f'Server not found: {server_id}')
