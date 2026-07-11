# =============================================================
# SCRIPT DE LANCEMENT - Mini Projet Microservices
# Lance les 2 services Symfony + le Frontend React
# =============================================================

$ROOT = "c:\Users\HP\Desktop\mini-projet-microservices"
$AUTH  = "$ROOT\backend\service-authentication"
$STUD  = "$ROOT\backend\service-students"
$EMTD  = "$ROOT\backend\service-gestion-emploi-du-temps"
$PROFS = "$ROOT\backend\service-gestion-profs"
$FRONT = "$ROOT\frontend-app"

function Ensure-MySqlDatabase {
    param([string]$dbName)

    $phpCode = '$pdo = new PDO("mysql:host=127.0.0.1;port=3306;charset=utf8mb4","root","", [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]); $pdo->exec("CREATE DATABASE IF NOT EXISTS ' + $dbName + ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");'
    php -r $phpCode 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "      Erreur lors de la creation de la base de donnees $dbName" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   LANCEMENT DU PROJET MICROSERVICES" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# --- SERVICE AUTHENTICATION ---
Write-Host "[1/5] Preparation du service-authentication..." -ForegroundColor Yellow

# Creer dossier var et JWT si inexistant
New-Item -ItemType Directory -Force -Path "$AUTH\var" | Out-Null
New-Item -ItemType Directory -Force -Path "$AUTH\config\jwt" | Out-Null

# Generer les cles JWT si elles n'existent pas
if (-not (Test-Path "$AUTH\config\jwt\private.pem")) {
    Write-Host "      Generation des cles JWT (auth)..." -ForegroundColor Gray
    Push-Location $AUTH
    php bin/console lexik:jwt:generate-keypair --skip-if-exists --quiet 2>&1 | Out-Null
    Pop-Location
}

# Migrations base de donnees auth
Push-Location $AUTH
Write-Host "      Migration base de donnees auth..." -ForegroundColor Gray
php bin/console doctrine:database:create --if-not-exists --quiet 2>&1 | Out-Null
php bin/console doctrine:migrations:migrate --no-interaction --quiet 2>&1 | Out-Null
Pop-Location
Write-Host "      OK" -ForegroundColor Green

# --- SERVICE STUDENTS ---
Write-Host "[2/5] Preparation du service-students..." -ForegroundColor Yellow

New-Item -ItemType Directory -Force -Path "$STUD\var" | Out-Null
New-Item -ItemType Directory -Force -Path "$STUD\config\jwt" | Out-Null

if (-not (Test-Path "$STUD\config\jwt\private.pem")) {
    Write-Host "      Generation des cles JWT (students)..." -ForegroundColor Gray
    Push-Location $STUD
    php bin/console lexik:jwt:generate-keypair --skip-if-exists --quiet 2>&1 | Out-Null
    Pop-Location
}

Push-Location $STUD
Write-Host "      Migration base de donnees students..." -ForegroundColor Gray
php bin/console doctrine:database:create --if-not-exists --quiet 2>&1 | Out-Null
php bin/console doctrine:migrations:migrate --no-interaction --quiet 2>&1 | Out-Null
Pop-Location
Write-Host "      OK" -ForegroundColor Green

# --- SERVICE GESTION EMPLOI DU TEMPS ---
Write-Host "[3/5] Preparation du service-gestion-emploi-du-temps..." -ForegroundColor Yellow

New-Item -ItemType Directory -Force -Path "$EMTD\var" | Out-Null
New-Item -ItemType Directory -Force -Path "$EMTD\config\jwt" | Out-Null

if (-not (Test-Path "$EMTD\config\jwt\private.pem")) {
    Write-Host "      Generation des cles JWT (emploi)..." -ForegroundColor Gray
    Push-Location $EMTD
    php bin/console lexik:jwt:generate-keypair --skip-if-exists --quiet 2>&1 | Out-Null
    Pop-Location
}

Ensure-MySqlDatabase 'db_emploi'

Push-Location $EMTD
Write-Host "      Migration base de donnees emploi..." -ForegroundColor Gray
php bin/console doctrine:database:create --if-not-exists --quiet 2>&1 | Out-Null
php bin/console doctrine:migrations:migrate --no-interaction --quiet 2>&1 | Out-Null
Pop-Location
Write-Host "      OK" -ForegroundColor Green

# --- SERVICE GESTION PROFS ---
Write-Host "[4/5] Preparation du service-gestion-profs..." -ForegroundColor Yellow

New-Item -ItemType Directory -Force -Path "$PROFS\var" | Out-Null
New-Item -ItemType Directory -Force -Path "$PROFS\config\jwt" | Out-Null

if (-not (Test-Path "$PROFS\config\jwt\private.pem")) {
    Write-Host "      Generation des cles JWT (profs)..." -ForegroundColor Gray
    Push-Location $PROFS
    php bin/console lexik:jwt:generate-keypair --skip-if-exists --quiet 2>&1 | Out-Null
    Pop-Location
}

Ensure-MySqlDatabase 'db_profs'

Push-Location $PROFS
Write-Host "      Migration base de donnees profs..." -ForegroundColor Gray
php bin/console doctrine:database:create --if-not-exists --quiet 2>&1 | Out-Null
php bin/console doctrine:migrations:migrate --no-interaction --quiet 2>&1 | Out-Null
Pop-Location
Write-Host "      OK" -ForegroundColor Green

# --- LANCEMENT DES SERVEURS ---
Write-Host ""
Write-Host "[5/5] Lancement des serveurs..." -ForegroundColor Yellow
Write-Host ""

# Lancer service-authentication dans un nouveau terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$AUTH'; Write-Host 'SERVICE AUTH - Port 8001' -ForegroundColor Cyan; php -S 127.0.0.1:8001 -t public public/index.php"

Start-Sleep -Seconds 1

# Lancer service-students dans un nouveau terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$STUD'; Write-Host 'SERVICE STUDENTS - Port 8002' -ForegroundColor Cyan; php -S 127.0.0.1:8002 -t public public/index.php"

Start-Sleep -Seconds 1

# Lancer service-gestion-emploi-du-temps dans un nouveau terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$EMTD'; Write-Host 'SERVICE GESTION EMPLOI DU TEMPS - Port 8003' -ForegroundColor Cyan; php -S 127.0.0.1:8003 -t public public/index.php"

Start-Sleep -Seconds 1

# Lancer service-gestion-profs dans un nouveau terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PROFS'; Write-Host 'SERVICE GESTION PROFS - Port 8004' -ForegroundColor Cyan; php -S 127.0.0.1:8004 -t public public/index.php"

Start-Sleep -Seconds 1

# Lancer le frontend dans un nouveau terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FRONT'; Write-Host 'FRONTEND REACT - Port 5173' -ForegroundColor Cyan; npm run dev -- --host 127.0.0.1"

Write-Host "=============================================" -ForegroundColor Green
Write-Host "  TOUS LES SERVICES SONT LANCES !" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend   -> http://localhost:5173" -ForegroundColor White
Write-Host "  Auth API   -> http://localhost:8001/api/auth/" -ForegroundColor White
Write-Host "  Students   -> http://localhost:8002/api/patients/" -ForegroundColor White
Write-Host "  Emploi     -> http://localhost:8003/api/status" -ForegroundColor White
Write-Host "  Profs      -> http://localhost:8004/api/status" -ForegroundColor White
Write-Host ""
Write-Host "  Fermez les 5 fenetres PowerShell pour tout arreter." -ForegroundColor Gray
Write-Host ""
