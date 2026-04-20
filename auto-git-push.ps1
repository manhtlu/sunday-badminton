<#
.SYNOPSIS
  Stage all, commit, optionally push.

.EXAMPLE
  .\auto-git-push.ps1
  .\auto-git-push.ps1 -Message "fix: typo in README"
  .\auto-git-push.ps1 "docs: update flow"   # positional (same as -Message)
  .\auto-git-push.ps1 -m "chore: cleanup" # alias for -Message
#>
param(
  [Parameter(Position = 0, HelpMessage = "Git commit message (default: chore: auto commit)")]
  [Alias("m")]
  [string]$Message = "chore: auto commit",

  [string]$Remote = "origin",
  [string]$Branch = "main",
  [switch]$SkipPushIfNoChanges = $true
)

$ErrorActionPreference = "Stop"

# Check working tree changes (including untracked) before staging/committing.
$porcelain = git status --porcelain
$hasChanges = ($porcelain -and $porcelain.Trim().Length -gt 0)

if (-not $hasChanges) {
  if ($SkipPushIfNoChanges) {
    Write-Host "No changes detected. Skipping add/commit/push."
    exit 0
  }
}

Write-Host "Running: git add ."
git add .

# Commit only if something is staged after `git add .`.
$stagedPorcelain = git diff --cached --name-only
if (-not $stagedPorcelain -or $stagedPorcelain.Trim().Length -eq 0) {
  Write-Host "No staged changes after add. Skipping commit/push."
  exit 0
}

Write-Host "Running: git commit -m `"$Message`""
git commit -m "$Message"

Write-Host "About to push to $Remote $Branch"
$answer = Read-Host "Push? (y/N)"
$answerNormalized = ""
if ($null -ne $answer) {
  $answerNormalized = $answer.Trim().ToLowerInvariant()
}

if ($answerNormalized -ne "y" -and $answerNormalized -ne "yes") {
  Write-Host "Push cancelled by user."
  exit 0
}

Write-Host "Running: git push $Remote $Branch"
git push $Remote $Branch

Write-Host "Done."

