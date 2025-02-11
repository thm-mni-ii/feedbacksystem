# Basisimage mit Python 3.10
FROM python:3.10-slim-buster
ENV PATH="$PATH:/root/.poetry/bin"

ENV DASH_DEBUG_MODE False

WORKDIR /app
# Installiere poetry
RUN pip install poetry && poetry config virtualenvs.in-project true
RUN poetry config virtualenvs.create false

COPY pyproject.toml .

# Installiere die Dependencies mit Poetry
RUN poetry install --no-root

COPY . .


# Starte die App mit Gunicorn
CMD [ "gunicorn", "--workers=5", "--threads=1", "-b 0.0.0.0:8050", "api.run_eat:server"]


