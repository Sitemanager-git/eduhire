# Simple manual test for teacher profile upload using curl.exe

# Step 1: Get token
Write-Host "Step 1: Getting JWT Token..." -ForegroundColor Cyan

# Create temp file for JSON
$loginJson = @'
{"email":"teacherqwe1@outlook.com","password":"testpass123"}
'@
$loginJson | Set-Content -Path "$env:TEMP\login.json" -Encoding UTF8

$tokenResponse = & 'C:\Windows\System32\curl.exe' -s -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  --data-binary "@$env:TEMP\login.json"

Write-Host "Response: $tokenResponse" -ForegroundColor Gray

if ($tokenResponse -like "*Too many*" -or $tokenResponse -like "*rate*") {
    Write-Host "⚠️  Rate limited. Waiting 60 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
    $tokenResponse = & 'C:\Windows\System32\curl.exe' -s -X POST http://localhost:5000/api/auth/login `
      -H "Content-Type: application/json" `
      --data-binary "@$env:TEMP\login.json"
}

$token = $tokenResponse | ConvertFrom-Json
$TOKEN = $token.token

Write-Host "✅ Token: $($TOKEN.Substring(0, 20))..." -ForegroundColor Green

# Step 2: Upload profile
Write-Host "`nStep 2: Uploading profile..." -ForegroundColor Cyan

$RESUME_PATH = "C:\Users\Ani\Documents\resume.pdf"
$PHOTO_PATH = "C:\Users\Ani\Documents\photo.jpg"

Write-Host "Using resume: $RESUME_PATH" -ForegroundColor Gray
Write-Host "Using photo: $PHOTO_PATH" -ForegroundColor Gray

# Create a properly formatted location JSON as a string
# Double-escape for curl/PowerShell compatibility
$location = ConvertTo-Json @{
    state = "Maharashtra"
    district = "Pune"
    pincode = "411001"
}

# Escape the location JSON for curl
$locationEscaped = $location.Replace('"', '\"')

$uploadResponse = & 'C:\Windows\System32\curl.exe' -s -X POST http://localhost:5000/api/teachers/profile `
  -H "Authorization: Bearer $TOKEN" `
  -F "fullName=Test Teacher" `
  -F "email=teacherqwe1@outlook.com" `
  -F "phone=9876543210" `
  -F "education=B.Ed" `
  -F "experience=5" `
  -F "subjects=[`"Math`",`"Science`"]" `
  -F "location=$locationEscaped" `
  -F "otherSubjects=" `
  -F "resume=@`"$RESUME_PATH`"" `
  -F "photo=@`"$PHOTO_PATH`""

Write-Host "`n✅ Response:" -ForegroundColor Green
Write-Host $uploadResponse -ForegroundColor Cyan

# Save response to file for inspection
$uploadResponse | Out-File -FilePath "D:\Apps\PythonDocs\Eduhire\upload-response.txt" -Encoding UTF8
Write-Host "Full response saved to: upload-response.txt" -ForegroundColor Gray

# Cleanup
Remove-Item -Path "$env:TEMP\login.json" -Force -ErrorAction SilentlyContinue
