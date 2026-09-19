# FULFILL-X AWS Teardown PowerShell Script (Phase 14)
Param(
    [string]$Region = $env:AWS_REGION,
    [string]$Environment = "production"
)

if (-not $Region) { $Region = "us-east-1" }

Write-Host "=== WARNING: Teardown FULFILL-X AWS Infrastructure ($Region) ===" -ForegroundColor Red
$Confirmation = Read-Host "Are you sure you want to destroy all AWS resources? (y/N)"

if ($Confirmation -eq "y" -or $Confirmation -eq "Y") {
    Set-Location -Path "infra/terraform"
    terraform destroy -auto-approve -var="aws_region=$Region" -var="environment=$Environment"
    Set-Location -Path "../.."
    Write-Host "Teardown Complete." -ForegroundColor Green
} else {
    Write-Host "Teardown cancelled." -ForegroundColor Yellow
}
