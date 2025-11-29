# PowerShell test script for Eduhire API
# This tests the teacher profile upload API

# ============================================================
# STEP 1: Login and get token
# ============================================================

Write-Host "Step 1: Getting JWT Token..." -ForegroundColor Cyan

try {
    $loginBody = @{
        email = "teacherqwe1@outlook.com"
        password = "testpass123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody

    $TOKEN = $loginResponse.token

    if (-not $TOKEN) {
        Write-Host "Failed to get token" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Got token: $($TOKEN.Substring(0, 20))..." -ForegroundColor Green
}
catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================================
# STEP 2: Upload profile with files
# ============================================================

Write-Host "`nStep 2: Uploading profile..." -ForegroundColor Cyan

# Note: Adjust these paths to your actual test files
$RESUME_PATH = "C:\Users\Ani\Documents\resume.docx"
$PHOTO_PATH = "C:\Users\Ani\Documents\photo.jpg"

if (-not (Test-Path $RESUME_PATH)) {
    Write-Host "Resume file not found at: $RESUME_PATH" -ForegroundColor Red
    Write-Host "Please save your resume to: $RESUME_PATH" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $PHOTO_PATH)) {
    Write-Host "Photo file not found at: $PHOTO_PATH" -ForegroundColor Red
    Write-Host "Please save your photo to: $PHOTO_PATH" -ForegroundColor Yellow
    exit 1
}

# Build multipart form data using WebClient for PowerShell 5.1 compatibility
try {
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=""fullName""$LF",
        "Test Teacher",
        "--$boundary",
        "Content-Disposition: form-data; name=""email""$LF",
        "teacherqwe1@outlook.com",
        "--$boundary",
        "Content-Disposition: form-data; name=""phone""$LF",
        "9876543210",
        "--$boundary",
        "Content-Disposition: form-data; name=""education""$LF",
        "B.Ed",
        "--$boundary",
        "Content-Disposition: form-data; name=""experience""$LF",
        "5",
        "--$boundary",
        "Content-Disposition: form-data; name=""subjects""$LF",
        '["Math","Science"]',
        "--$boundary",
        "Content-Disposition: form-data; name=""state""$LF",
        "Maharashtra",
        "--$boundary",
        "Content-Disposition: form-data; name=""district""$LF",
        "Pune",
        "--$boundary",
        "Content-Disposition: form-data; name=""pincode""$LF",
        "411001",
        "--$boundary",
        "Content-Disposition: form-data; name=""otherSubjects""$LF",
        "",
        "--$boundary",
        "Content-Disposition: form-data; name=""resume""; filename=""resume.docx""",
        "Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document$LF"
    )
    
    $resumeBytes = [System.IO.File]::ReadAllBytes($RESUME_PATH)
    $photoBytes = [System.IO.File]::ReadAllBytes($PHOTO_PATH)
    
    $bodyLines += $null  # Add null to trigger binary append
    
    $bodyLines += (
        "--$boundary",
        "Content-Disposition: form-data; name=""photo""; filename=""photo.jpg""",
        "Content-Type: image/jpeg$LF"
    )
    
    $bodyLines += (
        "--$boundary--"
    )
    
    # Build the body as string first
    $bodyString = $bodyLines -join $LF
    
    # Create headers
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    # Use WebClient for better binary handling
    $webClient = New-Object System.Net.WebClient
    $webClient.Headers.Add("Authorization", "Bearer $TOKEN")
    $webClient.Headers.Add("Content-Type", "multipart/form-data; boundary=$boundary")
    
    # Build complete multipart body
    $memoryStream = New-Object System.IO.MemoryStream
    $streamWriter = New-Object System.IO.StreamWriter($memoryStream)
    
    # Write text fields
    foreach ($line in $bodyLines | Select-Object -SkipLast 1) {
        $streamWriter.Write($line)
        $streamWriter.Write($LF)
    }
    
    # Close the stream to flush
    $streamWriter.Close()
    
    # Use Invoke-WebRequest instead (better multipart support in PS 5.1)
    $uploadUri = "http://localhost:5000/api/teachers/profile"
    
    # Alternative: use curl if available (simpler)
    $curlPath = "C:\Windows\System32\curl.exe"
    
    if (Test-Path $curlPath) {
        Write-Host "Using curl for multipart upload..." -ForegroundColor Gray
        
        $curlArgs = @(
            "-X", "POST",
            "-H", "Authorization: Bearer $TOKEN",
            "-F", "fullName=Test Teacher",
            "-F", "email=teacherqwe1@outlook.com",
            "-F", "phone=9876543210",
            "-F", "education=B.Ed",
            "-F", "experience=5",
            "-F", "subjects=[`"Math`",`"Science`"]",
            "-F", "state=Maharashtra",
            "-F", "district=Pune",
            "-F", "pincode=411001",
            "-F", "otherSubjects=",
            "-F", "resume=@$RESUME_PATH",
            "-F", "photo=@$PHOTO_PATH",
            "$uploadUri"
        )
        
        $output = & $curlPath @curlArgs 2>&1
        $response = $output | ConvertFrom-Json
    } else {
        # Fallback: use native PowerShell
        Write-Host "Using PowerShell native multipart..." -ForegroundColor Gray
        
        $response = Invoke-WebRequest -Uri $uploadUri `
            -Method POST `
            -Headers $headers `
            -InFile $RESUME_PATH `
            -ErrorAction Stop
    }
    
    Write-Host "`n✅ Profile uploaded successfully!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json | Write-Host
}
catch {
    Write-Host "`n❌ Upload failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================================
# STEP 3: Verify profile was created
# ============================================================

Write-Host "`nStep 3: Verifying profile was created..." -ForegroundColor Cyan

try {
    $getResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/teachers/profile" `
        -Method GET `
        -Headers @{"Authorization" = "Bearer $TOKEN"}

    if ($getResponse.name) {
        Write-Host "✅ Profile verified!" -ForegroundColor Green
        Write-Host "Name: $($getResponse.name)" -ForegroundColor Green
        Write-Host "Email: $($getResponse.email)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Could not verify profile" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠️ Could not verify profile: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ============================================================
# Expected Server Logs:
# 📝 [Teachers] Creating profile for user: xxxxx
# 📄 Resume uploaded: resume.docx
# 📸 Photo uploaded: photo.jpg
# ✅ Teacher profile created successfully
# ============================================================
