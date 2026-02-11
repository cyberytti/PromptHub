 # PromptHub

> **"You don't need a complex product. You need a clear purpose."**

A minimal, fast, and focused desktop application for managing AI prompts. No cloud dependencies. No subscription tiers. Just your prompts, organized.

---

## Why PromptHub Exists

Every AI power user faces the same friction: great prompts get lost in notes apps, chat histories, or scattered documents. PromptHub solves **one problem perfectly**—it gives you a dedicated, local space to store, categorize, and retrieve your best AI prompts.

> *"Solve one problem perfectly, and the market will notice."*

---

## What Makes It Different

| The Problem | PromptHub's Solution |
|-------------|---------------------|
| Prompts buried in Notion/Evernote | Dedicated prompt-first interface |
| Cloud services with privacy concerns | 100% local SQLite database |
| Bloated apps with learning curves | Open, write, save, find—in 10 seconds |
| Subscription fatigue | Free, open-source, yours forever |

> *"A simple tool that works is worth more than a powerful tool no one understands."*

---

## Features

- **⚡ Instant Capture** — Write and save prompts with minimal friction
- **🏷️ Smart Tagging** — Mark as Favorite/Not Favorite + categorize as System or User prompts
- **🔍 Fast Search** — Find prompts by title or content instantly
- **📋 One-Click Copy** — Copy prompt body to clipboard in one tap
- **🖥️ Native Desktop Feel** — PyWebView wrapper gives you a real app window, not a browser tab
- **💾 Truly Local** — All data lives in a single SQLite file on your machine

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | FastAPI (Python) |
| **Frontend** | Vanilla HTML/CSS/JS + Tailwind CSS |
| **Database** | SQLite3 |
| **Desktop Shell** | PyWebView |
| **Packaging** | Single executable via PyInstaller |

---

## Project Structure

```
PromptHub/
├── main.py              # FastAPI server + SQLite operations
├── desktop_app.py       # PyWebView desktop wrapper
├── index.html           # Landing page
├── write_prompt.html    # Create new prompts
├── show_prompts.html    # Browse, search, manage prompts
├── prompthub.db         # Local SQLite database (auto-created)
└── README.md            
```

---

## Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/cyberytti/PromptHub.git
cd PromptHub

# Install dependencies
pip install -r requirements.txt

# Run the desktop app
python3 desktop_app.py
```

The app window will open automatically. No browser required.


---

## Building for Distribution

```bash
# Create single executable
pip install pyinstaller
pyinstaller --onefile --windowed --add-data "index.html;." --add-data "write_prompt.html;." --add-data "show_prompts.html;." desktop_app.py
```

---

## License

GNU — Use it, fork it, make it yours.

---

## The Bottom Line

PromptHub does one thing: **it keeps your best AI prompts within reach.** 

No onboarding. No tutorials needed. Just open and write.

