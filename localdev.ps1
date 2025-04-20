# Cloudera AMP - Windows Startup Script
# Save this as start-amp.ps1 and run it in PowerShell (preferably as admin)

$ErrorActionPreference = "Stop"

# Load environment variables from .env
if (Test-Path ".env") {
    Get-Content .env | ForEach-Object {
        if ($_ -match "^\s*([^#=]+)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

$env:RAG_DATABASES_DIR = "$(Get-Location)\databases"
$env:MLFLOW_RECONCILER_DATA_PATH = "$(Get-Location)\llm-service\reconciler\data"

# Cleanup logic
function Cleanup {
    Write-Host "Cleaning up..."
    docker stop qdrant_dev | Out-Null
    Get-Process -Name "python", "java", "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*AMP*" } | Stop-Process -Force
}

# Register cleanup for exit
Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

# Stop qdrant if running
docker stop qdrant_dev | Out-Null

# Start Qdrant container
docker run --name qdrant_dev --rm -d -p 6333:6333 -p 6334:6334 -v "${PWD}\databases\qdrant_storage:/qdrant/storage" qdrant/qdrant

# Setup Python env and run tests
Set-Location llm-service

if (-not $env:USE_SYSTEM_UV) {
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    python -m pip install uv
} else {
    Write-Host "Using system uv"
}

.\venv\Scripts\Activate.ps1
uv sync
uv run pytest -sxvvra app

# Launch MLflow UI
Start-Process powershell -ArgumentList "uv run mlflow ui" -WindowStyle Hidden

# Start FastAPI backend
New-Item -ItemType Directory -Force -Path $env:MLFLOW_RECONCILER_DATA_PATH | Out-Null
Start-Process powershell -ArgumentList "uv run fastapi dev --port=8081" -WindowStyle Hidden

# Wait until FastAPI is ready
while (-not (Invoke-WebRequest -Uri "http://localhost:8081/amp" -UseBasicParsing -ErrorAction SilentlyContinue)) {
    Write-Host "Waiting for the Python backend to be ready..."
    Start-Sleep -Seconds 4
}

# Start MLflow reconciler
Start-Process powershell -ArgumentList "uv run reconciler/mlflow_reconciler.py" -WindowStyle Hidden

# Start Java Spring Boot backend
Set-Location ../backend
Start-Process powershell -ArgumentList "./gradlew.bat --console=plain bootRun" -WindowStyle Hidden

# Start frontend (pnpm build + dev)
Set-Location ../ui
pnpm install
pnpm build
Start-Process powershell -ArgumentList "pnpm dev" -WindowStyle Hidden

# Start Express proxy server
Set-Location ../express
npm run dev
