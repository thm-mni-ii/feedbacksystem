FROM python:3.12-slim
ENV PATH="$PATH:/root/.poetry/bin"

WORKDIR /the/workdir/path

RUN pip install poetry && poetry config virtualenvs.in-project true
RUN poetry config virtualenvs.create false

COPY pyproject.toml .

RUN poetry install --no-dev --no-root

COPY . .

CMD [ "gunicorn", "--workers=5", "--threads=1", "-b 0.0.0.0:3002", "src.main:app", "--timeout", "120"]
