"""HTTP routes for the GuardAI backend."""

from fastapi import APIRouter

from app.schemas.infrastructure import ExportResponse, PatchResponse, ReportResponse, ScanResponse, TopologyResponse
from app.services.infrastructure import deploy_patch, export_view, generate_report, get_topology, run_scan


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
