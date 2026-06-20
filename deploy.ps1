param(
    [string]$CommitMessage = "Corrección y despliegue automáticos",
    [switch]$NoPush,
    [switch]$TagImage,
    [string]$TagName,
    [string]$RollbackTag
)

function Exit-WithError {
    param([string]$Message)
    Write-Host "ERROR: $Message" -ForegroundColor Red
    exit 1
}

# Verificar directorio raíz del proyecto
if (-not (Test-Path -Path "package.json")) {
    Exit-WithError "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
}

Write-Host "=== Iniciando despliegue automático ===" -ForegroundColor Cyan

# Mostrar estado actual de git
Write-Host "\n1) Estado actual de Git:" -ForegroundColor Yellow
git status --short

# Añadir cambios y commitear si existe algo nuevo
$changes = git status --porcelain
if (-not [string]::IsNullOrWhiteSpace($changes)) {
    Write-Host "\n2) Añadiendo y commiteando cambios..." -ForegroundColor Yellow
    git add .
    git commit -m "$CommitMessage"
    if ($LASTEXITCODE -ne 0) {
        Exit-WithError "Fallo en git commit. Revisa el estado y vuelve a intentar."
    }
} else {
    Write-Host "\n2) No hay cambios nuevos para commitear." -ForegroundColor Green
}

git push
# Empujar cambios a remoto (si no se solicita --NoPush)
if (-not $NoPush) {
    Write-Host "\n3) Empujando cambios al repositorio remoto..." -ForegroundColor Yellow
    git push
    if ($LASTEXITCODE -ne 0) {
        Exit-WithError "Fallo en git push. Verifica tu conexión y credenciales."
    }
} else {
    Write-Host "\n3) Saltando git push (--NoPush activo)." -ForegroundColor Yellow
}

# Configuración de gcloud
Write-Host "\n4) Configurando gcloud..." -ForegroundColor Yellow
$project = "consulta-bbg"
gcloud config set project $project
if ($LASTEXITCODE -ne 0) {
    Exit-WithError "No se pudo configurar el proyecto de gcloud."
}
gcloud config set run/region us-central1
if ($LASTEXITCODE -ne 0) {
    Exit-WithError "No se pudo configurar la región de Cloud Run."
}
gcloud config set run/platform managed
if ($LASTEXITCODE -ne 0) {
    Exit-WithError "No se pudo configurar la plataforma de Cloud Run."
}

gcloud builds submit --tag gcr.io/$project/consulta-bbg --quiet
gcloud run deploy consulta-bbg --image gcr.io/$project/consulta-bbg --platform managed --region us-central1 --allow-unauthenticated --quiet
# Determinar commit short SHA
$sha = git rev-parse --short HEAD 2>$null
if ($LASTEXITCODE -ne 0) { $sha = "local" }

# Si se solicita tag de imagen, calcular nombre si no viene provisto
if ($TagImage) {
    if (-not $TagName) {
        $date = Get-Date -Format "yyyyMMdd-HHmm"
        $TagName = "${date}-$sha"
    }
    Write-Host "\n5) Construyendo la imagen con tag: $TagName" -ForegroundColor Yellow
    gcloud builds submit --tag gcr.io/$project/consulta-bbg:$TagName --quiet
    if ($LASTEXITCODE -ne 0) {
        Exit-WithError "Falló la construcción de la imagen con tag $TagName. Revisa los logs de Cloud Build."
    }
    $deployImage = "gcr.io/$project/consulta-bbg:$TagName"
} elseif ($RollbackTag) {
    Write-Host "\n5) Rollback solicitado al tag: $RollbackTag - no se construye imagen." -ForegroundColor Yellow
    $deployImage = "gcr.io/$project/consulta-bbg:$RollbackTag"
} else {
    Write-Host "\n5) Construyendo la imagen (latest)..." -ForegroundColor Yellow
    gcloud builds submit --tag gcr.io/$project/consulta-bbg --quiet
    if ($LASTEXITCODE -ne 0) {
        Exit-WithError "Falló la construcción de la imagen (latest). Revisa los logs de Cloud Build."
    }
    $deployImage = "gcr.io/$project/consulta-bbg"
}

# Desplegar a Cloud Run usando la imagen determinada
Write-Host "\n6) Desplegando a Cloud Run la imagen: $deployImage" -ForegroundColor Yellow
gcloud run deploy consulta-bbg --image $deployImage --platform managed --region us-central1 --allow-unauthenticated --quiet
if ($LASTEXITCODE -ne 0) {
    Exit-WithError "Fallo el despliegue a Cloud Run."
}

Write-Host "\n=== Despliegue completado correctamente ===" -ForegroundColor Green
Write-Host "Revisa tu servicio en la URL que mostrará gcloud al finalizar." -ForegroundColor Green
