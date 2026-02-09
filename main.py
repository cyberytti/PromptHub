from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import sqlite3

app = FastAPI(title="PromptHub API")
conn = sqlite3.connect('prompthub.db', check_same_thread=False)
cursor = conn.cursor()
cursor.execute("""CREATE TABLE IF NOT EXISTS PromptHub (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prompt_name VARCHAR(100) NOT NULL UNIQUE,
                prompt_body TEXT NOT NULL,
                date DATE NOT NULL,
                tag VARCHAR(50),
                category VARCHAR(50) NOT NULL
    );""")
conn.commit()


# Enable CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class PromptCreate(BaseModel):
    title: str
    body: str
    favorite: str  
    type: str     

class Prompt(PromptCreate):
    id: int
    date: str


# ============ API ENDPOINTS ============

@app.get("/api/prompts", response_model=List[Prompt])
def get_prompts(
    tag: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None
):
    
    
    lis=cursor.execute("SELECT * FROM PromptHub").fetchall()

    result=[]

    for d in lis:
        result.append ({
                'id': d[0],
                'title': d[1],
                'body': d[2],
                'date': d[3],
                'favorite': d[4],
                'type': d[5]
            })
    
    if tag and tag != "all":
        result = [p for p in result if p["favorite"] == tag]
    
    if category and category != "all":
        result = [p for p in result if p["type"] == category]
    
    if search:
        search_lower = search.lower()
        result = [
            p for p in result 
            if search_lower in p["title"].lower() or search_lower in p["body"].lower()
        ]
    
    return result

@app.post("/api/prompts", response_model=Prompt)
def create_prompt(prompt: PromptCreate):
    """Create a new prompt"""
    date_str = date.today().isoformat()
   
    
    cursor.execute("""
        INSERT INTO PromptHub (prompt_name, prompt_body, date, tag, category)
        VALUES (?, ?, ?, ?, ?)
    """, (prompt.title, prompt.body, date_str, prompt.favorite, prompt.type))
    
    conn.commit()
    
    # Get the last inserted ID
    new_id = cursor.lastrowid
    
    # Create response with CORRECT field names matching the Prompt model
    new_prompt = {
        "id": new_id,
        "title": prompt.title,      
        "body": prompt.body,        
        "favorite": prompt.favorite, 
        "type": prompt.type,        
        "date": date_str
    }
    
    
    
    return new_prompt


@app.delete("/api/prompts/{prompt_id}")
def delete_prompt(prompt_id: int):
    """Delete a prompt by ID"""
    cursor.execute("DELETE FROM PromptHub WHERE id = ?", (prompt_id,))
    conn.commit()
    return {"message": "Deleted successfully"}

# ============ STATIC FILES & FRONTEND ROUTES ============

@app.get("/")
async def serve_index():
    """Serve the main HTML page"""
    return FileResponse("index.html")

@app.get("/write_prompt.html")
async def serve_write_prompt():
    """Serve the write prompt page"""
    return FileResponse("write_prompt.html")

@app.get("/show_prompts.html")
async def serve_show_prompts():
    """Serve the show prompts page"""
    return FileResponse("show_prompts.html")

@app.get("/index.html")
async def serve_index_alt():
    """Serve index.html via explicit path"""
    return FileResponse("index.html")


app.mount("/static", StaticFiles(directory="."), name="static")


# Run with: uvicorn main:app --reload