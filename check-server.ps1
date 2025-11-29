# Quick server health check
Write-Host "Checking if server is running..." -ForegroundColor Cyan

try {
    Write-Host "Testing connection to http://localhost:5000..." -ForegroundColor Yellow
    
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 5 -ErrorAction Stop
    
    Write-Host "✅ Server is responding!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Server is NOT responding" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "TROUBLESHOOTING:" -ForegroundColor Yellow
    Write-Host "1. Is the server running?" -ForegroundColor Yellow
    Write-Host "2. Check: cd server && npm start" -ForegroundColor Yellow
    Write-Host "3. Is MongoDB connected?" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Server is running!" -ForegroundColor Green
