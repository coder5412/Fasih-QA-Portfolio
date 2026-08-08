# Fasih QA Portfolio — Flask + HTML + CSS + JavaScript

## Project structure

- `app.py` — Flask backend + real-time AI chatbot API
- `templates/index.html` — portfolio page
- `static/css/style.css` — all styling and animations
- `static/js/app.js` — UI interactions + streaming chatbot
- `static/images/profile.jpg` — profile image
- `requirements.txt` — Python dependencies
- `.env.example` — environment variable template

## Run on Windows

Open Command Prompt/PowerShell inside this folder:

```bash
python -m venv venv
venv\Scriptsctivate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_real_api_key
OPENAI_MODEL=gpt-5.5
PORT=5000
```

Then:

```bash
python app.py
```

Open:

http://127.0.0.1:5000

## Important

The OpenAI key is kept server-side in `.env`; it is NOT placed in HTML or JavaScript.

The chatbot streams responses from the Flask endpoint `/api/chat`, so the answer appears in real time.

For production deployment, use a Flask-compatible host and store `OPENAI_API_KEY` as a server environment variable.
Do not upload `.env` to GitHub.

OpenAI's Responses API supports streaming output events; this project uses that server-side pattern.


## Windows troubleshooting

If Flask keeps printing `Detected change in ... site-packages` and restarts:

1. Stop the server with `Ctrl+C`.
2. Use the included `run.bat`, which creates an isolated Python 3.11 virtual environment.
3. The updated `app.py` has `debug=False` and `use_reloader=False`, so the Windows watchdog will not continuously restart the app.
4. The OpenAI SDK is imported lazily only when `/api/chat` is called, so the portfolio itself can start even if the SDK is slow to import.

Recommended commands:

```bat
py -3.11 -m venv venv
venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

Then open:

http://127.0.0.1:5000

To test the OpenAI package separately:

```bat
python -c "from openai import OpenAI; print('OpenAI SDK OK')"
```

If that command hangs, reinstall the packages inside the virtual environment:

```bat
pip uninstall openai pydantic -y
pip install -r requirements.txt
```
