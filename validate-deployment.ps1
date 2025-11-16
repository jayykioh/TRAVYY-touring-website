# ==========================================
# Pre-Deployment Validation Script
# Run this before deploying to check if all required configurations are set
# ==========================================

Write-Host "🔍 TRAVYY - Pre-Deployment Validation" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# Check if .env file exists
Write-Host "📋 Checking .env file..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Write-Host "❌ .env file not found! Please copy .env.example to .env" -ForegroundColor Red
    $errors++
} else {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    # Load .env file
    $envContent = Get-Content ".env" -Raw
    
    # Required variables
    $requiredVars = @(
        "JWT_ACCESS_SECRET",
        "JWT_REFRESH_SECRET",
        "MONGO_ROOT_USERNAME",
        "MONGO_ROOT_PASSWORD",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "PAYPAL_CLIENT_ID",
        "PAYPAL_CLIENT_SECRET",
        "GEMINI_API_KEY",
        "GOONG_API_KEY"
    )
    
    Write-Host "`n📝 Checking required environment variables..." -ForegroundColor Yellow
    foreach ($var in $requiredVars) {
        if ($envContent -match "$var=(.+)") {
            $value = $matches[1].Trim()
            if ($value -eq "" -or $value -like "*your_*" -or $value -like "*<*>*") {
                Write-Host "❌ $var is not set or has placeholder value" -ForegroundColor Red
                $errors++
            } else {
                Write-Host "✅ $var is set" -ForegroundColor Green
            }
        } else {
            Write-Host "❌ $var is missing" -ForegroundColor Red
            $errors++
        }
    }
    
    # Check CORS configuration
    Write-Host "`n🌐 Checking CORS configuration..." -ForegroundColor Yellow
    if ($envContent -match "CORS_ORIGINS=(.+)") {
        $corsOrigins = $matches[1].Trim()
        if ($corsOrigins -match "localhost") {
            Write-Host "⚠️  CORS_ORIGINS still contains localhost - OK for dev, update for production" -ForegroundColor Yellow
            $warnings++
        } else {
            Write-Host "✅ CORS_ORIGINS configured for production" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  CORS_ORIGINS not set - will use default localhost" -ForegroundColor Yellow
        $warnings++
    }
    
    # Check OAuth callbacks
    Write-Host "`n🔐 Checking OAuth callbacks..." -ForegroundColor Yellow
    if ($envContent -match "GOOGLE_CALLBACK_URL=(.+)") {
        $googleCallback = $matches[1].Trim()
        if ($googleCallback -match "localhost") {
            Write-Host "⚠️  GOOGLE_CALLBACK_URL uses localhost - update for production" -ForegroundColor Yellow
            $warnings++
        } else {
            Write-Host "✅ GOOGLE_CALLBACK_URL configured" -ForegroundColor Green
        }
    }
    
    if ($envContent -match "FACEBOOK_CALLBACK_URL=(.+)") {
        $facebookCallback = $matches[1].Trim()
        if ($facebookCallback -match "localhost") {
            Write-Host "⚠️  FACEBOOK_CALLBACK_URL uses localhost - update for production" -ForegroundColor Yellow
            $warnings++
        } else {
            Write-Host "✅ FACEBOOK_CALLBACK_URL configured" -ForegroundColor Green
        }
    }
    
    # Check PayPal mode
    Write-Host "`n💳 Checking PayPal configuration..." -ForegroundColor Yellow
    if ($envContent -match "PAYPAL_MODE=(.+)") {
        $paypalMode = $matches[1].Trim()
        if ($paypalMode -eq "sandbox") {
            Write-Host "⚠️  PAYPAL_MODE is 'sandbox' - change to 'live' for production" -ForegroundColor Yellow
            $warnings++
        } else {
            Write-Host "✅ PAYPAL_MODE set to '$paypalMode'" -ForegroundColor Green
        }
    }
}

# Check Docker
Write-Host "`n🐳 Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found! Please install Docker Desktop" -ForegroundColor Red
    $errors++
}

try {
    $dockerComposeVersion = docker-compose --version
    Write-Host "✅ Docker Compose installed: $dockerComposeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose not found!" -ForegroundColor Red
    $errors++
}

# Check Dockerfiles
Write-Host "`n📦 Checking Dockerfile existence..." -ForegroundColor Yellow
$dockerfiles = @(
    "touring-fe/Dockerfile",
    "touring-be/Dockerfile",
    "ai/Dockerfile"
)

foreach ($dockerfile in $dockerfiles) {
    if (Test-Path $dockerfile) {
        Write-Host "✅ $dockerfile exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $dockerfile not found!" -ForegroundColor Red
        $errors++
    }
}

# Check docker-compose.yml
Write-Host "`n📋 Checking docker-compose.yml..." -ForegroundColor Yellow
if (Test-Path "docker-compose.yml") {
    Write-Host "✅ docker-compose.yml exists" -ForegroundColor Green
} else {
    Write-Host "❌ docker-compose.yml not found!" -ForegroundColor Red
    $errors++
}

# Summary
Write-Host "`n=========================================`n" -ForegroundColor Cyan
Write-Host "📊 VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ All checks passed! Ready to deploy" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "  1. docker-compose build" -ForegroundColor White
    Write-Host "  2. docker-compose up -d" -ForegroundColor White
    Write-Host "  3. docker-compose logs -f`n" -ForegroundColor White
} elseif ($errors -eq 0) {
    Write-Host "⚠️  $warnings warning(s) found - review before production deployment" -ForegroundColor Yellow
    Write-Host "`nYou can proceed with deployment, but review warnings above.`n" -ForegroundColor White
} else {
    Write-Host "❌ $errors error(s) found - please fix before deploying" -ForegroundColor Red
    if ($warnings -gt 0) {
        Write-Host "⚠️  $warnings warning(s) found`n" -ForegroundColor Yellow
    }
    Write-Host "`nFix the errors above before proceeding with deployment.`n" -ForegroundColor White
    exit 1
}
