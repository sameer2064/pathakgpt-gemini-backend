const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a shared chat session per user (memory in-session)
const chatSessions = {};

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;
  const sessionId = req.body.sessionId || "default"; // Optional client-provided session ID

  try {
    // Create a new chat session if not exists
    if (!chatSessions[sessionId]) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const chat = model.startChat({
        history: [], // Start with empty history
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });

      chatSessions[sessionId] = chat;
    }

    const chat = chatSessions[sessionId];
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    const text = response.text();

    res.json({ text });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Gemini Backend with Memory Running for PathakGPT");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
