param(
  [switch]$OpenDashboard
)

$ErrorActionPreference = 'Stop'
$RunnerName = 'receitasapi_sonar_runner'
$SonarUrl = 'http://localhost:9000'

function Get-EnvToken {
  if (-not [string]::IsNullOrWhiteSpace($env:SONAR_TOKEN)) {
    return $env:SONAR_TOKEN
  }

  if (Test-Path '.env') {
    $tokenLine = Get-Content '.env' | Where-Object { $_ -match '^SONAR_TOKEN=.+' } | Select-Object -First 1
    if ($tokenLine) {
      return $tokenLine.Substring('SONAR_TOKEN='.Length).Trim()
    }
  }

  return $null
}

$token = Get-EnvToken
if ([string]::IsNullOrWhiteSpace($token)) {
  throw 'SONAR_TOKEN nao encontrado. Rode primeiro: npm run sonar:setup'
}

$env:SONAR_TOKEN = $token

try {
  $bytes = [Text.Encoding]::ASCII.GetBytes("${token}:")
  $headers = @{ Authorization = "Basic $([Convert]::ToBase64String($bytes))" }
  $validation = Invoke-RestMethod -Uri "$SonarUrl/api/authentication/validate" -Headers $headers
  if (-not $validation.valid) {
    throw 'Token invalido.'
  }
} catch {
  throw 'SONAR_TOKEN invalido para o SonarQube local. Rode: npm run sonar:setup:reset'
}

Write-Host 'Iniciando analise SonarQube...'
docker compose --profile sonar up --build --force-recreate -d sonar

Write-Host 'Acompanhando logs do runner...'
docker logs -f $RunnerName

$exitCode = docker inspect -f '{{.State.ExitCode}}' $RunnerName
if ($exitCode -ne '0') {
  throw "Runner do SonarQube falhou com exit code $exitCode. Veja os logs acima."
}

Write-Host 'Analise SonarQube finalizada com sucesso.'

if ($OpenDashboard) {
  Start-Process $SonarUrl
}
