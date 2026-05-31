$body = @{name='Test';email='test@test.com';subject='Test';message='Hello'}
$json = $body | ConvertTo-Json
try {
  $result = Invoke-RestMethod -Uri 'http://localhost:3000/api/contact' -Method Post -Body $json -ContentType 'application/json'
  Write-Output "SUCCESS: $($result | ConvertTo-Json)"
} catch {
  Write-Output "ERROR: $($_.Exception.Message)"
}
