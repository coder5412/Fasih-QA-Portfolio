// ============================================================
// FASIH QA PORTFOLIO - FRONTEND JS + GEMINI CHAT
// Flask backend: /api/chat/stream
// ============================================================


// ------------------------------------------------------------
// CUSTOM CURSOR
// ------------------------------------------------------------

const cursor = document.getElementById("cursor");

if (cursor) {
    window.addEventListener("mousemove", (e) => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
    });
}


// ------------------------------------------------------------
// CARD MOUSE GLOW
// ------------------------------------------------------------

document.querySelectorAll(".card").forEach((card) => {

    card.addEventListener("mousemove", (e) => {

        const rect = card.getBoundingClientRect();

        const x =
            ((e.clientX - rect.left) / rect.width) * 100;

        const y =
            ((e.clientY - rect.top) / rect.height) * 100;

        card.style.setProperty("--x", x + "%");
        card.style.setProperty("--y", y + "%");
    });

});


// ------------------------------------------------------------
// SCROLL REVEAL
// ------------------------------------------------------------

const observer = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }

        });

    },
    {
        threshold: 0.12
    }
);


document.querySelectorAll(".reveal").forEach((element) => {
    observer.observe(element);
});


// ------------------------------------------------------------
// MOBILE MENU
// ------------------------------------------------------------

const menu = document.getElementById("menu");
const navlinks = document.getElementById("navlinks");

if (menu && navlinks) {

    menu.addEventListener("click", () => {
        navlinks.classList.toggle("open");
    });

}


document.querySelectorAll(".navlinks a").forEach((link) => {

    link.addEventListener("click", () => {

        if (navlinks) {
            navlinks.classList.remove("open");
        }

    });

});


// ============================================================
// AI CHATBOT
// ============================================================

let chatHistory = [];


// ------------------------------------------------------------
// ADD MESSAGE
// ------------------------------------------------------------

function addMessage(text, type) {

    const box = document.getElementById("messages");

    if (!box) {
        console.error("Chat messages container not found.");
        return null;
    }


    const div = document.createElement("div");

    div.className = "msg " + type;

    div.textContent = text;

    box.appendChild(div);


    box.scrollTop = box.scrollHeight;


    return div;
}


// ------------------------------------------------------------
// UPDATE AI STATUS
// ------------------------------------------------------------

function updateAIStatus(statusText) {

    const status = document.getElementById("aiStatus");

    if (status) {
        status.textContent = statusText;
    }

}


// ============================================================
// SEND MESSAGE TO FLASK + GEMINI
// ============================================================
async function sendMsg(q) {
    q = q.trim();

    if (!q) return;

    addMessage(q, 'user');

    chatHistory.push({
        role: 'user',
        content: q
    });

    const bot = addMessage('Thinking...', 'bot');
    const status = document.getElementById('aiStatus');

    status.textContent = 'thinking…';

    try {
        const response = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: chatHistory.slice(-10)
            })
        });

        const data = await response.json();

        console.log('Server response:', data);

        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }

        if (!data.text) {
            throw new Error('Gemini returned an empty response.');
        }

        bot.textContent = data.text;

        chatHistory.push({
            role: 'assistant',
            content: data.text
        });

        status.textContent = 'live AI';

        const box = document.getElementById('messages');
        box.scrollTop = box.scrollHeight;

    } catch (error) {
        console.error('AI Error:', error);

        bot.textContent = 'AI Error: ' + error.message;

        status.textContent = 'offline';
    }
}


// ============================================================
// SEND BUTTON
// ============================================================

const sendButton =
    document.getElementById("send");


const chatInput =
    document.getElementById("chatInput");


if (sendButton && chatInput) {

    sendButton.addEventListener(
        "click",
        () => {

            const message =
                chatInput.value.trim();


            if (!message) {
                return;
            }


            // Clear input immediately
            chatInput.value = "";


            sendMsg(message);

        }
    );

}


// ============================================================
// ENTER KEY
// ============================================================

if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                if (sendButton) {
                    sendButton.click();
                }

            }

        }
    );

}


// ============================================================
// QUICK QUESTIONS
// ============================================================

document
    .querySelectorAll(".quick button")
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const question =
                    button.dataset.q;


                if (question) {
                    sendMsg(question);
                }

            }
        );

    });


// ============================================================
// CHECK GEMINI / FLASK CONNECTION
// ============================================================

async function checkAIConnection() {

    try {

        const response =
            await fetch(
                "/api/health"
            );


        if (!response.ok) {
            throw new Error(
                "Health check failed"
            );
        }


        const data =
            await response.json();


        console.log(
            "AI Health:",
            data
        );


        if (
            data.ai_configured === true
        ) {

            updateAIStatus(
                "live AI"
            );

        } else {

            updateAIStatus(
                "API key missing"
            );

            console.warn(
                "GEMINI_API_KEY is not configured."
            );

        }


    } catch (error) {

        console.error(
            "Flask connection failed:",
            error
        );


        updateAIStatus(
            "offline"
        );

    }

}


// Run health check when page loads
checkAIConnection();