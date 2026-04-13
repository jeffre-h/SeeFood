FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY backend /app/backend

WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "gunicorn -b 0.0.0.0:${PORT} --timeout 300 app:app"]
