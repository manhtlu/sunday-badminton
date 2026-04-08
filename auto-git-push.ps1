param(
  [string]$message = "chore: auto commit",
  [string]$remote = "origin",
  [string]$branch = "main",
  [switch]$skipPushIfNoChanges = $true
)

$ErrorActionPreference = "Stop"

# Check working tree changes (including untracked) before staging/committing.
$porcelain = git status --porcelain
$hasChanges = ($porcelain -and $porcelain.Trim().Length -gt 0)

if (-not $hasChanges) {
  if ($skipPushIfNoChanges) {
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

Write-Host "Running: git commit -m $message"
git commit -m $message

Write-Host "About to push to $remote $branch"
$answer = Read-Host "Push? (y/N)"
$answerNormalized = ""
if ($null -ne $answer) {
  $answerNormalized = $answer.Trim().ToLowerInvariant()
}

if ($answerNormalized -ne "y" -and $answerNormalized -ne "yes") {
  Write-Host "Push cancelled by user."
  exit 0
}

Write-Host "Running: git push $remote $branch"
git push $remote $branch

Write-Host "Done."

