# PowerShell script to test POST /api/teachers/profile endpoint
# Usage: .\test-profile-api.ps1

# Configuration
$SERVER_URL = "http://localhost:5000/api"
$EMAIL = "teacherqwe1@outlook.com"
$PASSWORD = "yourpassword"  # Change this!

# File paths (change these to your actual test files)
$RESUME_FILE = "C:\Users\YourUsername\Desktop\resume.docx"
$PHOTO_FILE = "C:\Users\YourUsername\Desktop\photo.jpg"

Write-Host "🚀 Starting Teacher Profile API Test..." -ForegroundColor Cyan

# Step 1: Login to get JWT token
Write-Host "`n📝 Step 1: Logging in..." -ForegroundColor Yellow

$loginBody = @{
    email = $EMAIL
    password = $PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$SERVER_URL/auth/login" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body $loginBody

    $TOKEN = $loginResponse.token
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   Token: $($TOKEN.Substring(0, 20))..." -ForegroundColor Gray
}
catch {
    Write-Host "❌ Login failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Step 2: Verify files exist
Write-Host "`n📂 Step 2: Checking files..." -ForegroundColor Yellow

if (-not (Test-Path $RESUME_FILE)) {
    Write-Host "❌ Resume file not found: $RESUME_FILE" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Resume file found" -ForegroundColor Green

if (-not (Test-Path $PHOTO_FILE)) {
    Write-Host "❌ Photo file not found: $PHOTO_FILE" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Photo file found" -ForegroundColor Green

# Step 3: Create multipart form data
Write-Host "`n📤 Step 3: Uploading profile..." -ForegroundColor Yellow

$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

# Build form data
$bodyLines = @()

# Add text fields
$fields = @{
    "fullName" = "Test Teacher"
    "email" = $EMAIL
    "phone" = "9876543210"
    "education" = "B.Ed"
    "experience" = "5"
    "state" = "Maharashtra"
    "district" = "Pune"
    "pincode" = "411001"
    "subjects" = '["Math","Science"]'
    "otherSubjects" = ""
}

foreach ($field in $fields.GetEnumerator()) {
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"$($field.Key)`""
    $bodyLines += ""
    $bodyLines += $field.Value
}

# Add resume file
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"resume`"; filename=`"$(Split-Path $RESUME_FILE -Leaf)`""
$bodyLines += "Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document"
$bodyLines += ""
$resumeContent = [System.IO.File]::ReadAllBytes($RESUME_FILE)
$bodyLines += [System.Text.Encoding]::Default.GetString($resumeContent)

# Add photo file
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"photo`"; filename=`"$(Split-Path $PHOTO_FILE -Leaf)`""
$bodyLines += "Content-Type: image/jpeg"
$bodyLines += ""
$photoContent = [System.IO.File]::ReadAllBytes($PHOTO_FILE)
$bodyLines += [System.Text.Encoding]::Default.GetString($photoContent)

$bodyLines += "--$boundary--"
$bodyLines += ""

$body = $bodyLines -join $LF

# Make the request
try {
    $response = Invoke-RestMethod -Uri "$SERVER_URL/teachers/profile" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $TOKEN"
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        } `
        -Body $body `
        -TimeoutSec 120

    Write-Host "✅ Profile created successfully!" -ForegroundColor Green
    Write-Host "`n📊 Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json | Write-Host
}
catch {
    Write-Host "❌ Upload failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        try {
            $errorBody = $_.Exception.Response.Content.ReadAsStringAsync().Result
            Write-Host "`n📋 Server Response:" -ForegroundColor Yellow
            Write-Host $errorBody -ForegroundColor Yellow
        }
        catch {}
    }
    exit 1
}

Write-Host "`n✨ Test completed successfully!" -ForegroundColor Green
