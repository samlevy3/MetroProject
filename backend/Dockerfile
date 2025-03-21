FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ src/

ENV PORT 8080
EXPOSE 8080

CMD exec gunicorn --bind :$PORT src.app:APP 

CMD exec gunicorn src.app:APP --bind 0.0.0.0:$PORT --workers 4 --threads 2 