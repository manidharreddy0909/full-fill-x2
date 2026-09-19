# FULFILL-X — Complete AWS Deployment & Production Guide (Phase 14)

---

## 1. Prerequisites & System Requirements
Before deploying FULFILL-X to AWS, ensure the following command-line tools are installed:
- **AWS CLI** (`v2.15+`): `aws --version`
- **Terraform** (`v1.5.0+`): `terraform --version`
- **Docker Engine** (`v24.0+`): `docker --version`
- **Node.js** (`v20+`): `node --version`
- **Python** (`v3.12+`): `python --version`

---

## 2. AWS Account & Authentication Setup
Authenticate your local environment with valid AWS credentials:
```bash
aws configure
# Enter AWS Access Key ID
# Enter AWS Secret Access Key
# Default region: us-east-1
# Default output format: json
```

Verify authentication status:
```bash
aws sts get-caller-identity
```

---

## 3. Configurable AWS Region Setup
FULFILL-X supports configurable AWS region deployment via `AWS_REGION`:
```bash
export AWS_REGION="us-east-1"
```
Or on Windows PowerShell:
```powershell
$env:AWS_REGION = "us-east-1"
```

---

## 4. Terraform Infrastructure Provisioning
Provision the complete AWS cloud topology (S3, CloudFront, ECR, ECS Fargate, ALB, Security Groups, IAM Roles, CloudWatch):
```bash
cd infra/terraform
terraform init
terraform plan -var="aws_region=$AWS_REGION" -var="environment=production"
terraform apply -auto-approve -var="aws_region=$AWS_REGION" -var="environment=production"
```

Capture output variables:
```bash
export ECR_URL=$(terraform output -raw ecr_repository_url)
export ALB_DNS=$(terraform output -raw alb_dns_name)
export S3_BUCKET=$(terraform output -raw s3_bucket_name)
export CF_DOMAIN=$(terraform output -raw cloudfront_domain_name)
cd ../..
```

---

## 5. Amazon ECR Container Build & Push
Authenticate Docker against AWS ECR and push the backend container:
```bash
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_URL"
docker build -t "$ECR_URL:latest" ./backend
docker push "$ECR_URL:latest"
```

---

## 6. ECS Fargate Backend Service Deployment
Force an ECS deployment update to pull the new container image:
```bash
aws ecs update-service --cluster fulfillx-cluster --service fulfillx-backend-service --force-new-deployment --region "$AWS_REGION"
```

---

## 7. Application Load Balancer (ALB) Routing
The ALB routes incoming HTTP traffic on port `80` to backend ECS tasks on container port `8000`.
- **Target Group Health Check**: `HTTP GET /health` (15s interval)
- **WebSocket Timeout**: 86400 seconds (24 hours) persistent idle connection timeout.

---

## 8. S3 Frontend Static Asset Deployment
Build the React production bundle targeting the ALB backend URL and upload static assets to S3:
```bash
cd frontend
VITE_API_BASE_URL="http://$ALB_DNS" VITE_WS_URL="ws://$ALB_DNS" npm run build
aws s3 sync dist/ "s3://$S3_BUCKET/" --delete
cd ..
```

---

## 9. CloudFront CDN & SPA Routing
CloudFront caches static assets globally and handles single-page application (SPA) routing:
- **Default Root Object**: `index.html`
- **SPA Fallback**: 404 HTTP errors map to `/index.html` with 200 OK status.
- **Cache Invalidation**:
```bash
CF_DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='FULFILL-X Frontend CDN Distribution'].Id" --output text)
aws cloudfront create-invalidation --distribution-id "$CF_DIST_ID" --paths "/*"
```

---

## 10. Amazon Bedrock AI Integration
FULFILL-X integrates with Amazon Bedrock via `BedrockProvider`:
- **Model**: `anthropic.claude-3-sonnet-20240229-v1:0`
- **IAM Authorization**: Task Role uses `bedrock:InvokeModel` policy.
- **Fallback**: If unconfigured, the factory gracefully falls back to `MockAIProvider`.

---

## 11. Environment Configuration & Secrets
Environment parameters are defined in ECS Task Definition environment variables. Secrets can be passed via AWS SSM Parameter Store:
```bash
aws ssm put-parameter --name "/fulfillx/GEMINI_API_KEY" --type "SecureString" --value "your_api_key_here"
```

---

## 12. WebSocket Production Verification
Test real-time event streaming path (`Browser -> ALB -> ECS -> EventBus`):
```bash
# Verify WS connection
wscat -c "ws://$ALB_DNS/ws"
# Expect PONG and SUBSCRIBED events
```

---

## 13. End-to-End Scenario Execution
Execute full workflow on deployed environment:
1. Open `https://$CF_DOMAIN`
2. Load synthetic supply network graph
3. Inject disruption signal (e.g. Supplier Halt)
4. Execute 6 Specialist Agents $\rightarrow$ Coordinator $\rightarrow$ Adversary $\rightarrow$ Multi-Objective Planner $\rightarrow$ Verification
5. Approve Candidate Plan

---

## 14. Observability & CloudWatch Logs
View real-time backend container logs:
```bash
aws logs tail /ecs/fulfillx-backend --follow --region "$AWS_REGION"
```

---

## 15. Automated Production Smoke Tests
Run automated production smoke tests against the deployed ALB endpoint:
```bash
./scripts/aws/smoke-test.sh "http://$ALB_DNS"
```
Or on PowerShell:
```powershell
.\scripts\aws\smoke-test.ps1 -BackendUrl "http://$ALB_DNS"
```

---

## 16. Controlled Failure & Resilience Testing
- **Backend Restart**: `aws ecs update-service --cluster fulfillx-cluster --service fulfillx-backend-service --force-new-deployment` (ALB drains traffic cleanly).
- **WebSocket Reconnect**: Disconnect network interface; client auto-reconnects with exponential backoff.

---

## 17. Security Hardening & Compliance
- Zero secrets committed to Git repository.
- Containers run under non-root user `fulfillx` (UID 10001).
- Least-privilege IAM roles and Security Group ingress rules.

---

## 18. Troubleshooting Guide
- **ALB Unhealthy Target**: Check ECS task logs using `aws logs tail /ecs/fulfillx-backend`. Ensure port `8000` is bound.
- **CloudFront 403 Forbidden**: Verify S3 bucket policy permits `AllowCloudFrontOAC`.
- **CORS Error**: Ensure ALB DNS name is present in `CORS_ORIGINS`.

---

## 19. Infrastructure Teardown
To destroy all provisioned AWS resources and avoid unexpected charges:
```bash
./scripts/aws/destroy.sh
```
Or on PowerShell:
```powershell
.\scripts\aws\destroy.ps1
```

---

## 20. Cost Notes & Optimization
- **Fargate Task**: ~1 vCPU / 1GB RAM (~$15/mo)
- **ALB**: ~$18/mo
- **CloudFront & S3**: < $2/mo
- **Total**: ~$35-40/mo. Tear down when not in use.
