FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN groupadd -r app && useradd -r -g app app
ENV PATH="/home/app/.local/bin:${PATH}" \
    PYTHONUNBUFFERED=1

COPY backend/requirements.txt /tmp/requirements.txt
RUN pip --no-cache-dir install -r /tmp/requirements.txt

COPY backend/ /app/
COPY backend/entrypoint.py /app/entrypoint.py

RUN chown -R app:app /app
USER app

EXPOSE 8000
ENTRYPOINT ["python", "/app/entrypoint.py"]

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]