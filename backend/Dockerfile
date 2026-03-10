# (replaced/updated Dockerfile for smaller image, non-root user and reproducible builds)
FROM python:3.11-slim

# minimal deps for runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# create non-root user
RUN groupadd -r app && useradd -r -g app app
ENV PATH="/home/app/.local/bin:${PATH}" \
    PYTHONUNBUFFERED=1 \
    POETRY_VIRTUALENVS_CREATE=false

# copy requirements and install
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip --no-cache-dir install -r /tmp/requirements.txt

# copy app code
COPY backend/ /app/
# copy entrypoint (included in backend/)
COPY backend/entrypoint.py /app/entrypoint.py

RUN chown -R app:app /app
USER app

EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -sf --max-time 2 http://127.0.0.1:8000/api/status | grep -q '"ok":' || exit 1

# use entrypoint to wait for GTFS resource before starting uvicorn
ENTRYPOINT ["python", "/app/entrypoint.py"]

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]