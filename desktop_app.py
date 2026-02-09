import threading
import webview
import uvicorn
from main import app  

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

if __name__ == "__main__":
    # Start FastAPI server in background thread
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    window = webview.create_window("PromptHub", "http://127.0.0.1:8000",text_select=True)
    webview.start()
