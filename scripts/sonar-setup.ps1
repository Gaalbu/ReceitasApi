param(
  [string]$AdminPassword = 'ReceitasApi@123',
  [string]$TokenName = 'receitasapi-local-token',
  [switch]$Reset
)

$ErrorActionPreference = 'Stop'
$SonarUrl = 'http://localhost:9000'
$AdminUser = 'admin'

function New-BasicAuthHeader([string]$User, [string]$Password) {
  $bytes = [Text.Encoding]::ASCII.GetBytes("${User}:${Password}")
  return @{ Authorization = "Basic $([Convert]::ToBase64String($bytes))" }
}

function Invoke-SonarApi([string]$Method, [string]$Path, [string]$Password, [hashtable]$Body = @{}) {
  $headers = New-BasicAuthHeader $AdminUser $Password
  return Invoke-RestMethod -Method $Method -Uri "$SonarUrl$Path" -Headers $headers -ContentType 'application/x-www-form-urlencoded' -Body $Body
}

function Test-SonarAuth([string]$Password) {
  try {
    $result = Invoke-SonarApi 'Get' '/api/authentication/validate' $Password
    return [bool]$result.valid
  } catch {
    return $false
  }
}

if ($Reset) {
  Write-Host 'Resetando volumes do SonarQube...'
  docker compose --profile sonar down -v
}

Write-Host 'Subindo SonarQube local...'
docker compose --profile sonar up -d sonar-db sonarqube

Write-Host 'Aguardando SonarQube ficar UP...'
$isUp = $false
for ($i = 1; $i -le 60; $i++) {
  try {
    $status = Invoke-RestMethod -Uri "$SonarUrl/api/system/status"
    if ($status.status -eq 'UP') {
      $isUp = $true
      break
    }
  } catch {
  }
  Start-Sleep -Seconds 5
}

if (-not $isUp) {
  throw 'SonarQube nao ficou UP dentro do tempo esperado.'
}

if (-not (Test-SonarAuth $AdminPassword)) {
  Write-Host 'Configurando senha conhecida do admin...'
  try {
    Invoke-SonarApi 'Post' '/api/users/change_password' 'admin' @{
      login = $AdminUser
      previousPassword = 'admin'
      password = $AdminPassword
    } | Out-Null
  } catch {
  }
}

if (-not (Test-SonarAuth $AdminPassword)) {
  throw "Nao foi possivel autenticar no SonarQube. Se a senha foi alterada manualmente, rode: npm run sonar:setup:reset"
}

Write-Host 'Gerando token do scanner...'
try {
  Invoke-SonarApi 'Post' '/api/user_tokens/revoke' $AdminPassword @{ name = $TokenName } | Out-Null
} catch {
}

$tokenResponse = Invoke-SonarApi 'Post' '/api/user_tokens/generate' $AdminPassword @{ name = $TokenName }
$token = $tokenResponse.token

if ([string]::IsNullOrWhiteSpace($token)) {
  throw 'A API do SonarQube nao retornou token.'
}

Set-Content -Path '.env' -Value "SONAR_TOKEN=$token" -Encoding ASCII

Write-Host ''
Write-Host 'SonarQube pronto para a apresentacao.'
Write-Host "URL: $SonarUrl"
Write-Host "Login: $AdminUser"
Write-Host "Senha: $AdminPassword"
Write-Host 'Token gravado em .env.'
Write-Host ''
Write-Host 'Agora rode:'
Write-Host 'npm run sonar:all'
