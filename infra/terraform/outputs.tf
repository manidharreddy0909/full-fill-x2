output "cloudfront_domain_name" {
  description = "CloudFront Distribution Domain Name (Frontend App URL)"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS Name (Backend API URL)"
  value       = aws_alb.main.dns_name
}

output "ecr_repository_url" {
  description = "AWS ECR Backend Container Repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "s3_bucket_name" {
  description = "AWS S3 Frontend Host Bucket Name"
  value       = aws_s3_bucket.frontend.id
}
