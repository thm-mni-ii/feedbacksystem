from fastapi import FastAPI
from submission_api import router as submission_router
from api import router as pdf_router

app = FastAPI()
app.include_router(submission_router)
app.include_router(pdf_router)
