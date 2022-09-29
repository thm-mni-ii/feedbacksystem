FROM python:3.10

ENV PIP_DISABLE_PIP_VERSION_CHECK=on

RUN pip install poetry

WORKDIR /app
COPY poetry.lock pyproject.toml README.md /app/

COPY api /app/api

RUN poetry config virtualenvs.create false
RUN poetry install --no-interaction

CMD ["sh", "-c", "python3 /app/api/main.py $api $mongodb"]
