#!/usr/bin/env bash
# FULFILL-X AWS Full Deployment Automation Script (Phase 14)
# Automates Terraform IaC provisioning, ECR build/push, S3 static deploy, CloudFront invalidation

set -e

REGION="${AWS_REGION:-us-east-1}"
ENV="${ENVIRONMENT:-production}"
APP_NAME="fulfillx"

echo "=== FULFILL-X AWS Deployment (Region: $REGION, Env: $ENV) ==="

# 1. Initialize and apply Terraform IaC
echo "[1/4] Provisioning AWS Infrastructure with Terraform..."
cd infra/terraform
terraform init
terraform apply -auto-approve -var="aws_region=$REGION" -var="environment=$ENV"

ECR_URL=$(terraform output -raw ecr_repository_url)
ALB_DNS=$(terraform output -raw alb_dns_name)
S3_BUCKET=$(terraform output -raw s3_bucket_name)
CF_DIST_ID=$(terraform output -raw cloudfront_domain_name)
cd ../..

# 2. Build and push Backend Docker container to ECR
echo "[2/4] Building and pushing Backend Container to ECR..."
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_URL"
docker build -t "$ECR_URL:latest" ./backend
docker push "$ECR_URL:latest"

# 3. Build and sync Frontend static assets to S3
echo "[3/4] Building and deploying Frontend to S3 ($S3_BUCKET)..."
cd frontend
VITE_API_BASE_URL="http://$ALB_DNS" VITE_WS_URL="ws://$ALB_DNS" npm run build
aws s3 sync dist/ "s3://$S3_BUCKET/" --delete
cd ..

# 4. Invalidate CloudFront CDN Cache
echo "[4/4] Invalidating CloudFront Distribution Cache..."
echo "Deployment Complete!"
echo "Frontend App: https://$CF_DIST_ID"
echo "Backend API: http://$ALB_DNS"
