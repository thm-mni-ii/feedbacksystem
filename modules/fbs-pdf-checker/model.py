from pydantic import BaseModel

class ScoredTask(BaseModel):
    title: str
    score: float
    max: float
    feedback: str

