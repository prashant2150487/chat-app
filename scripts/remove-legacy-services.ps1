# Removes leftover `services/chat-service/node_modules` if Windows locked it after the monolith merge.
# Close any terminal/IDE using that folder, then run from repo root.

$path = Join-Path $PSScriptRoot "..\services\chat-service"
if (-not (Test-Path $path)) {
  Write-Host "Nothing to clean."
  exit 0
}

Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object { $_.CommandLine -match "chat-service" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

Start-Sleep -Seconds 1
Remove-Item -LiteralPath $path -Recurse -Force -ErrorAction Stop
Write-Host "Removed services/chat-service"
