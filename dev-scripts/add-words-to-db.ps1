## USAGE: [From the root director] .\dev-scripts\add-words.ps1 keycloak verylongword
[CmdletBinding()]
param(
  # All words passed as normal arguments
  [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
  [string[]] $Words
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$DbPath = Join-Path $ProjectRoot "scowl.db"

if (!(Test-Path $DbPath)) {
  throw "Database not found at: $DbPath"
}

# Resolve sqlite3 from PATH (or allow a local sqlite3.exe next to the script)
$LocalSqlite = Join-Path $ScriptDir "sqlite3.exe"
if (Test-Path $LocalSqlite) {
  $SqliteExe = $LocalSqlite
} else {
  $cmd = Get-Command sqlite3 -ErrorAction SilentlyContinue
  if (-not $cmd) {
    throw "sqlite3 not found. Ensure sqlite3.exe is in PATH or next to this script."
  }
  $SqliteExe = $cmd.Source
}

# Combine args + pipeline input
$all = @()
if ($Words) { $all += $Words }
$all += @($input)  # if nothing piped, this is empty

# Clean + trim + drop empties
$all = $all |
  ForEach-Object { if ($_ -ne $null) { $_.ToString().Trim() } } |
  Where-Object { $_ -and $_.Length -gt 0 }

if ($all.Count -eq 0) { return }

# De-dupe while preserving order
$seen = New-Object 'System.Collections.Generic.HashSet[string]'
$uniq = New-Object System.Collections.Generic.List[string]
foreach ($w in $all) {
  if ($seen.Add($w)) { $uniq.Add($w) }
}

function Escape-SqlLiteral([string]$s) {
  return $s.Replace("'", "''")
}

$values = $uniq | ForEach-Object { "('" + (Escape-SqlLiteral $_) + "')" }
$valuesList = [string]::Join(", ", $values)

$sql = @"
BEGIN;
INSERT INTO english_words (word) VALUES $valuesList;
COMMIT;
"@

# Run sqlite3 and feed SQL via stdin
$p = New-Object System.Diagnostics.Process
$p.StartInfo.FileName = $SqliteExe
$p.StartInfo.Arguments = "`"$DbPath`""
$p.StartInfo.RedirectStandardInput = $true
$p.StartInfo.RedirectStandardOutput = $true
$p.StartInfo.RedirectStandardError  = $true
$p.StartInfo.UseShellExecute = $false
$p.StartInfo.CreateNoWindow  = $true

[void]$p.Start()
$p.StandardInput.WriteLine($sql)
$p.StandardInput.Close()

$stdout = $p.StandardOutput.ReadToEnd()
$stderr = $p.StandardError.ReadToEnd()
$p.WaitForExit()

if ($p.ExitCode -ne 0) {
  throw "sqlite3 failed (exit $($p.ExitCode)).`n$stderr"
}

if ($stdout.Trim().Length -gt 0) { Write-Host $stdout }
if ($stderr.Trim().Length -gt 0) { Write-Warning $stderr }

Write-Host "Inserted $($uniq.Count) word(s) into $DbPath"
