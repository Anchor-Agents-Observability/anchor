resource "aws_service_discovery_service" "redis" {
  name = "redis"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.main.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}

resource "aws_ecs_task_definition" "redis" {
  family                   = "${var.project_name}-redis"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.redis_cpu
  memory                   = var.redis_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn

  volume {
    name = "redis-data"

    efs_volume_configuration {
      file_system_id = aws_efs_file_system.redis.id
      root_directory = "/"
    }
  }

  container_definitions = jsonencode([{
    name      = "redis"
    image     = "redis:7-alpine"
    essential = true

    command = ["redis-server", "--appendonly", "yes", "--dir", "/data"]

    portMappings = [{
      containerPort = 6379
      hostPort      = 6379
      protocol      = "tcp"
    }]

    mountPoints = [{
      sourceVolume  = "redis-data"
      containerPath = "/data"
      readOnly      = false
    }]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "redis"
      }
    }

    healthCheck = {
      command     = ["CMD", "redis-cli", "ping"]
      interval    = 10
      timeout     = 5
      retries     = 5
      startPeriod = 10
    }
  }])
}

resource "aws_ecs_service" "redis" {
  name            = "${var.project_name}-redis"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.redis.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  platform_version = "1.4.0"

  network_configuration {
    subnets         = [aws_subnet.private[0].id]
    security_groups = [aws_security_group.redis.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.redis.arn
  }
}
