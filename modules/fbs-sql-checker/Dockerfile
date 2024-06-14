# inspired by https://github.com/python-poetry/poetry/issues/1178#issuecomment-1238475183
FROM python:3.10 AS builder

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

RUN pip install poetry && poetry config virtualenvs.in-project true

WORKDIR "/app"
COPY . .

RUN poetry install --only main --no-dev

FROM python:3.10-alpine

WORKDIR "/app"

RUN apk update && apk add libpq

RUN adduser \
  --disabled-password \
  --home "$(pwd)" \
  --no-create-home \
  "app"
USER app

COPY --from=builder "/app" .

CMD ["sh", "-c", "./.venv/bin/python api/main.py $api $mongodb"]
