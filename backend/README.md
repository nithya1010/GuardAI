# GuardAI Backend

Production-ready backend foundation for GuardAI built with FastAPI.

## Stack

- Python
- FastAPI
- Pydantic
- Uvicorn
- python-dotenv

## Features

- FastAPI application bootstrap
- CORS middleware
- Environment-based configuration loading
- Structured logging configuration
- Root health check endpoint
- Swagger UI and OpenAPI documentation enabled

## Run

1. Create and activate a Python virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Start the server from the backend directory:

```bash
uvicorn app.main:app --reload
```

4. Open the API docs:

```text
http://127.0.0.1:8000/docs
```

## Health Check

GET /

Response:

```json
{
  "project": "GuardAI",
  "status": "running",
  "version": "1.0.0"
}
```
