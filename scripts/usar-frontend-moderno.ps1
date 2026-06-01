$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

function Invoke-Checked {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Command)
  & $Command[0] $Command[1..($Command.Length - 1)]
  if ($LASTEXITCODE -ne 0) {
    throw "El comando fallo: $($Command -join ' ')"
  }
}

$TargetBranch = "frontend-modernizacion"
$CurrentBranch = (git branch --show-current).Trim()

if ($CurrentBranch -ne $TargetBranch) {
  $Dirty = git status --porcelain
  if ($Dirty) {
    Write-Error "Hay cambios sin guardar. Guarda/commitea los cambios antes de cambiar al frontend moderno."
    exit 1
  }

  Invoke-Checked git switch $TargetBranch
}

Invoke-Checked docker compose stop vrisa
Invoke-Checked docker compose up --build vrisa -d

Write-Host "Frontend moderno activo en http://localhost:8082/vr-isa/"
