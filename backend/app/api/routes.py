"""HTTP routes for the GuardAI backend."""

from fastapi import APIRouter, HTTPException, Query

from app.schemas.infrastructure import ExportResponse, PatchResponse, ReportResponse, ScanResponse, ServerCreate, ServerDeleteResponse, ServerDiagnosisResponse, ServerLogsResponse, ServerSSHResponse, ServerSummary, TopologyResponse
from app.services.infrastructure import add_server, delete_server, deploy_patch, diagnose_server, export_view, generate_report, get_server_logs, get_ssh_connection, get_topology, list_servers, run_scan


router = APIRouter()


@router.get("/", tags=["health"])
async def health_check() -> dict[str, str]:
    """Return a lightweight service health response."""

    return {
        "project": "GuardAI",
        "status": "running",
        "version": "1.0.0",
    }


@router.get("/topology", response_model=TopologyResponse, tags=["topology"])
async def read_topology() -> TopologyResponse:
    """Return the current infrastructure topology used by the digital twin."""

    return get_topology()


@router.post("/actions/scan", response_model=ScanResponse, tags=["actions"])
async def run_infrastructure_scan() -> ScanResponse:
    """Return a deterministic infrastructure scan payload."""

    return run_scan()


@router.post("/actions/patch", response_model=PatchResponse, tags=["actions"])
async def deploy_infrastructure_patch() -> PatchResponse:
    """Return a deterministic patch deployment acknowledgement."""

    return deploy_patch()


@router.get("/reports/latest", response_model=ReportResponse, tags=["reports"])
async def read_latest_report() -> ReportResponse:
    """Return the latest executive report payload."""

    return generate_report()


@router.get("/export/view", response_model=ExportResponse, tags=["export"])
async def read_export_view() -> ExportResponse:
    """Return the current digital twin export payload."""

    return export_view()


@router.get("/servers", response_model=list[ServerSummary], tags=["servers"])
async def read_servers(
    cluster: str | None = Query(default=None),
    status: str | None = Query(default=None),
    query: str | None = Query(default=None),
) -> list[ServerSummary]:
    """Return the fleet inventory with optional filters."""

    return list_servers(cluster=cluster, status=status, query=query)


@router.post("/servers", response_model=ServerSummary, tags=["servers"])
async def create_server(payload: ServerCreate) -> ServerSummary:
    """Create a new server in the in-memory fleet."""

    return add_server(payload)


@router.get("/servers/{server_id}/logs", response_model=ServerLogsResponse, tags=["servers"])
async def read_server_logs(server_id: str) -> ServerLogsResponse:
    """Return deterministic logs for a server."""

    try:
        return get_server_logs(server_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/servers/{server_id}/ssh", response_model=ServerSSHResponse, tags=["servers"])
async def connect_to_server(server_id: str) -> ServerSSHResponse:
    """Return deterministic SSH connection details."""

    try:
        return get_ssh_connection(server_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/servers/{server_id}/diagnose", response_model=ServerDiagnosisResponse, tags=["servers"])
async def diagnose_selected_server(server_id: str) -> ServerDiagnosisResponse:
    """Return deterministic diagnosis results for a server."""

    try:
        return diagnose_server(server_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/servers/{server_id}", response_model=ServerDeleteResponse, tags=["servers"])
async def remove_server(server_id: str) -> ServerDeleteResponse:
    """Remove a server from the in-memory fleet."""

    try:
        return delete_server(server_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
