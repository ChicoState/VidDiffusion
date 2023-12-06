# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the maintainer label
LABEL maintainer="cybaca@proton.me"

# Set environment variables
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /app

# Clone the repository
RUN apt-get update && \
    apt-get install -y git ffmpeg libsm6 libxext6 && \
    git clone https://github.com/bes-dev/stable_diffusion.openvino.git .

# Install any needed dependencies
# (You might need to add more dependencies or install requirements if there's a requirements.txt)
RUN pip install --no-cache-dir -r requirements.txt

# Command to run the script
CMD ["python", "demo.py", "--prompt", "Street-art painting of retired Vin Diesel in style of Banksy, photorealism", "--output", "output/output.png"]

# The output will likely be a file, let's assume it's called "output.png" for now
# We'll use VOLUME to ensure it's accessible outside the container
VOLUME ["/app/output"]

