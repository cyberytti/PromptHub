from pydantic import BaseModel

# Pydantic models for request/response
class PromptCreate(BaseModel):
    title: str
    body: str
    favorite: str  
    type: str     

class Prompt(PromptCreate):
    id: int
    date: str

# Pydantic model for update request
class PromptUpdate(BaseModel):
    body: str