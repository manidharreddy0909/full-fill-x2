variable "aws_region" {
  description = "AWS Deployment Region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Application Environment"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application Name"
  type        = string
  default     = "fulfillx"
}

variable "backend_container_port" {
  description = "Backend container listening port"
  type        = number
  default     = 8000
}

variable "ecs_task_cpu" {
  description = "Fargate CPU units"
  type        = string
  default     = "512" # 0.5 vCPU
}

variable "ecs_task_memory" {
  description = "Fargate Memory (MB)"
  type        = string
  default     = "1024" # 1 GB
}
