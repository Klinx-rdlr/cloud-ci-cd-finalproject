terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-1" 
}

# 1. Security Group 
resource "aws_security_group" "web_sg" {
  name        = "intern-project-sg"
  description = "Allow SSH and Web traffic"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # For your Node.js app
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 2. EC2 Instance
resource "aws_instance" "app_server" {

  ami           = "ami-08d59269edddde222" 
  instance_type = "t3.micro"
  key_name      = "Demo-KP" 

  vpc_security_group_ids = [aws_security_group.web_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              # 1. Update and install Docker
              sudo apt-get update -y
              sudo apt-get install -y docker.io

              # 2. Start Docker service
              sudo systemctl start docker
              sudo systemctl enable docker

              # 3. ubuntu user permission to run Docker commands
              sudo usermod -aG docker ubuntu

              # 4. Application Directory
              mkdir -p /home/ubuntu/chef-app
              chown ubuntu:ubuntu /home/ubuntu/chef-app
              EOF

  tags = {
    Name = "AI-Chef-Server"
  }
}

# 3. Elastic IP (Static IP)
resource "aws_eip" "static_ip" {
  instance = aws_instance.app_server.id
  domain   = "vpc"
}

# 4. Public IP 
output "public_ip" {
  value = aws_eip.static_ip.public_ip
}