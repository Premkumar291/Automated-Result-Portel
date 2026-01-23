# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required for pdfplumber (checking if any specific ones are needed, usually slim is fine but might need build tools for some libs)
# pdfplumber -> pdfminer.six. Minimal dependencies.

# Copy the requirements file into the container
COPY requirements.txt .

# Install object dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application using Gunicorn with Uvicorn workers
# Workers = 2 * CPU + 1 is a good start, but for container we might set default or use env var
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]
