# ==============================================================================
# Advent of Code Solutions Explorer - Dockerfile
# Lightweight Python 3.12 deployment container
# ==============================================================================

FROM python:3.12-slim

# Set non-interactive environment & unbuffered stdout/stderr
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Set working directory
WORKDIR /app

# Copy application files (excluding patterns in .dockerignore)
COPY . /app

# Expose port (default 8000, can be overridden by $PORT at runtime)
EXPOSE 8000

# Health check to verify API responsiveness (uses dynamic $PORT if provided)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD python -c "import os, urllib.request; p = os.environ.get('PORT', '8000'); urllib.request.urlopen(f'http://127.0.0.1:{p}/api/days')" || exit 1

# Run the lightweight web server
CMD ["python", "server.py"]
