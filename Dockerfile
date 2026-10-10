# ==============================================================================
# Advent of Code Solutions Explorer - Dockerfile
# Lightweight Python 3.12 deployment container
# ==============================================================================

FROM python:3.12-slim

# Set non-interactive environment & unbuffered stdout/stderr
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    HOST=0.0.0.0

# Set working directory
WORKDIR /app

# Copy application files (excluding patterns in .dockerignore)
COPY . /app

# Expose port (default 8000)
EXPOSE 8000

# Health check to verify API responsiveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/days')" || exit 1

# Run the lightweight web server
CMD ["python", "server.py"]
