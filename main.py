from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from typing import List, Optional
from datetime import date
import sqlite3
import os
from backend.schema_models.schema_models import Prompt,PromptCreate,PromptUpdate


app = FastAPI(title="PromptHub API")


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.makedirs("backend/database/", exist_ok=True)
DB_PATH = os.path.join(BASE_DIR, 'backend/database/prompthub.db')

conn = sqlite3.connect(DB_PATH, check_same_thread=False)
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


@app.put("/api/prompts/{prompt_id}")
def update_prompt(prompt_id: int, prompt_update: PromptUpdate):
    """Update a prompt body by ID - prints values to console"""
    # print(f"UPDATE REQUEST RECEIVED:")
    # print(f"  Prompt ID: {prompt_id}")
    # print(f"  New Body: {prompt_update.body}")

    cursor.execute("UPDATE PromptHub SET prompt_body = ? WHERE id = ?",(prompt_update.body, prompt_id))
    conn.commit()

    return {
        "message": "Update request received", 
        "id": prompt_id, 
        "body": prompt_update.body
    }


# ============ STATIC FILES & FRONTEND ROUTES ============


def get_file_path(filename):
    return os.path.join(BASE_DIR, filename)

@app.get("/")
async def serve_index():
    """Serve the main HTML page"""
    return FileResponse(get_file_path("frontend/index.html"))

@app.get("/write_prompt.html")
async def serve_write_prompt():
    """Serve the write prompt page"""
    return FileResponse(get_file_path("frontend/write_prompt.html"))

@app.get("/show_prompts.html")
async def serve_show_prompts():
    """Serve the show prompts page"""
    return FileResponse(get_file_path("frontend/show_prompts.html"))

@app.get("/index.html")
async def serve_index_alt():
    """Serve frontend/index.html via explicit path"""
    return FileResponse(get_file_path("frontend/index.html"))


app.mount("/frontend/static", StaticFiles(directory=os.path.join(BASE_DIR, "frontend/static")), name="static")
app.mount("/frontend/scripts", StaticFiles(directory=os.path.join(BASE_DIR, "frontend/scripts")), name="scripts")

# Run with: uvicorn main:app --reload
