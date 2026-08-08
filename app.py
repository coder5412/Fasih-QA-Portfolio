import os
import json

from flask import (
    Flask,
    render_template,
    request,
    Response,
    jsonify,
    stream_with_context
)

from dotenv import load_dotenv
from google import genai


# Load .env
load_dotenv()

app = Flask(__name__)


# =========================================================
# GEMINI CONFIGURATION
# =========================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.5-flash"
)


# =========================================================
# AI SYSTEM PROMPT
# =========================================================

SYSTEM_PROMPT = """
You are Fasih QA Copilot, the professional portfolio assistant
for Fasih ur Rehman.

Use ONLY the following verified portfolio information:

- Software Engineering graduate from DHA Suffa University, BSSE.
- Focus: Software Quality Assurance, software testing,
  API validation and quality engineering.

QA:
- Manual testing
- Functional testing
- Regression testing
- Integration testing
- API testing
- Test-case design
- Bug reporting

Tools:
- Postman
- JIRA (basic)
- Selenium (basic)

Programming:
- Java
- Python
- JavaScript

Backend:
- Spring
- Spring Boot
- Flask

Frontend:
- HTML
- CSS

Databases:
- MySQL
- SQL
- PostgreSQL
- SQLite

Methodologies:
- SDLC
- STLC
- Agile
- Scrum

Experience:

Codignize Solution
Intern Software Engineer
Sep 2024 - Dec 2024

Responsibilities:
- Web application development/testing
- Functional testing
- Defect reporting
- REST API testing with Postman
- Developer collaboration
- Agile sprint activities

TechStep Solutions
SEO Intern
Sep 2025 - Nov 2025

Responsibilities:
- Website quality analysis
- Usability checks
- Performance checks
- Functionality validation
- Analytics

Projects:

1. Real-Time Gesture to Voice Converter
- Tested AI mobile application
- Test case design
- API testing with Postman
- Usability testing
- Response accuracy testing

2. Contact Manager-AI
- Natural-language search
- Duplicate detection
- Smart categorization
- NLP queries
- Predictive tagging
- RESTful architecture

3. Ecommerce Backend System
- Java Spring Boot
- Authentication
- Products
- Cart
- Orders
- REST APIs
- Postman testing

4. Taleem Wallet
- Scholarship platform
- Student dashboards
- Provider dashboards

Contact:
Email: fasihur54@gmail.com
Phone: 0332 3646064
LinkedIn: fasih-ur-rehman-636784286
GitHub: coder5412

Rules:

- Be concise, professional and friendly.
- Do not invent certifications.
- Do not invent employers.
- Do not invent awards.
- Do not invent tools.
- Do not invent achievements.
- Do not invent dates.
- Do not claim information that is not provided above.

If a question is outside Fasih's portfolio,
say that you are Fasih's portfolio assistant and offer
to answer about his QA skills, experience, projects,
education or contact details.
"""


# =========================================================
# GEMINI CLIENT
# =========================================================

def get_gemini_client():

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return None

    return genai.Client(
        api_key=api_key
    )


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return render_template("index.html")


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/api/health")
def health():

    return jsonify({
        "ok": True,
        "ai_configured": bool(
            os.getenv("GEMINI_API_KEY")
        ),
        "provider": "gemini",
        "model": GEMINI_MODEL
    })


# =========================================================
# GEMINI STREAMING CHAT
# =========================================================

@app.post("/api/chat/stream")
def chat_stream():
    client = get_gemini_client()

    if client is None:
        return jsonify({
            "error": "GEMINI_API_KEY is not configured."
        }), 503

    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])

    if not isinstance(messages, list) or not messages:
        return jsonify({
            "error": "Please enter a message."
        }), 400

    # Convert frontend messages to Gemini format
    contents = []

    for message in messages[-10:]:
        if not isinstance(message, dict):
            continue

        role = message.get("role")
        content = message.get("content")

        if role in ("user", "assistant") and isinstance(content, str):
            if content.strip():
                contents.append({
                    "role": "model" if role == "assistant" else "user",
                    "parts": [
                        {"text": content[:2000]}
                    ]
                })

    if not contents:
        return jsonify({
            "error": "No valid message found."
        }), 400

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config={
                "system_instruction": SYSTEM_PROMPT,
                "temperature": 0.7,
            }
        )

        text = response.text

        if not text:
            return jsonify({
                "error": "Gemini returned an empty response."
            }), 500

        return jsonify({
            "text": text
        })

    except Exception as e:
        app.logger.exception("Gemini API error")

        return jsonify({
            "error": str(e)
        }), 500

# =========================================================
# START FLASK
# =========================================================

if __name__ == "__main__":

    app.run(

        host="127.0.0.1",

        port=int(
            os.getenv(
                "PORT",
                "5000"
            )
        ),

        debug=True,

        use_reloader=False
    )
