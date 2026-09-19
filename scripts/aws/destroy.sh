#!/usr/bin/env bash
# FULFILL-X AWS Teardown Script (Phase 14)
# Warning: Destroys all provisioned AWS resources (ECS, ALB, S3, ECR, CloudFront)

set -e

REGION="${AWS_REGION:-us-east-1}"
ENV="${ENVIRONMENT:-production}"

echo "=== WARNING: Teardown FULFILL-X AWS Infrastructure ==="
read -p "Are you sure you want to destroy all AWS resources in $REGION? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd infra/terraform
    terraform destroy -auto-approve -var="aws_region=$REGION" -var="environment=$ENV"
    echo "Teardown Complete."
else
    echo "Teardown cancelled."
fi
