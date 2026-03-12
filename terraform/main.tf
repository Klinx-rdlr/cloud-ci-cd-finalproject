terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-southeast-1" # You can change this to your preferred region
}

# 1. Create a Security Group (The Firewall)
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

  # PRO TIP: This script runs automatically when the server starts!
  # It saves you 30 minutes of manual setup.
  user_data = <<-EOF
              #!/bin/bash
              sudo apt update -y
              curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
              sudo apt install -y nodejs
              sudo npm install -g pm2
              EOF

  tags = {
    Name = "AI-Powered-Intern-Server"
  }
}

# 3. Create an Elastic IP (Static IP)
resource "aws_eip" "static_ip" {
  instance = aws_instance.app_server.id
  domain   = "vpc"
}

# 4. Output the IP so you can copy it easily
output "public_ip" {
  value = aws_eip.static_ip.public_ip
}