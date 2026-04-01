resource "aws_efs_file_system" "redis" {
  creation_token = "${var.project_name}-redis-efs"
  encrypted      = true

  tags = { Name = "${var.project_name}-redis-efs" }
}

resource "aws_efs_mount_target" "redis" {
  count           = length(aws_subnet.private)
  file_system_id  = aws_efs_file_system.redis.id
  subnet_id       = aws_subnet.private[count.index].id
  security_groups = [aws_security_group.efs.id]
}

resource "aws_security_group" "efs" {
  name_prefix = "${var.project_name}-efs-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.redis.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-efs-sg" }
}
