# FULFILL-X AWS Full Deployment PowerShell Script (Phase 14)
Param(
    [string]$Region = $env:AWS_REGION,
    [string]$Environment = "production"
)

if (-not $Region) { $Region = "us-east-1" }

Write-Host "=== FULFILL-X AWS Deployment (Region: $Region, Environment: $Environment) ===" -ForegroundColor Green

# 1. Terraform Provisioning
Write-Host "[1/4] Provisioning AWS Infrastructure with Terraform..." -ForegroundColor Yellow
Set-Location -Path "infra/terraform"
terraform init
terraform apply -auto-approve -var="aws_region=$Region" -var="environment=$Environment"

$EcrUrl = (terraform output -raw ecr_repository_url)
$AlbDns = (terraform output -raw alb_dns_name)
$S3Bucket = (terraform output -raw s3_bucket_name)
$CfDomain = (terraform output -raw cloudfront_domain_name)
Set-Location -Path "../.."

# 2. Build and Push Backend Container
Write-Host "[2/4] Building and pushing Backend Container to ECR..." -ForegroundColor Yellow
(Get-ECRLoginCommand -Region $Region).Execute()
docker build -t "$EcrUrl:latest" ./backend
docker push "$EcrUrl:latest"

# 3. Build and Deploy Frontend Static Assets
Write-Host "[3/4] Building and deploying Frontend to S3 ($S3Bucket)..." -ForegroundColor Yellow
$env:VITE_API_BASE_URL = "http://$AlbDns"
$env:VITE_WS_URL = "ws://$AlbDns"
Set-Location -Path "frontend"
npm run build
aws s3 sync dist/ "s3://$S3Bucket/" --delete
Set-Location -Path ".."

Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Frontend App: https://$CfDomain"
Write-Host "Backend API:  http://$AlbDns"
