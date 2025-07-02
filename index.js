const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🧠 Memory storage (in server memory per session — resets when server restarts)
let conversationHistory = [];

// 🔥 API endpoint
app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      }
    });

    // Add user's message to history
    conversationHistory.push({ role: "user", parts: [{ text: userMessage }] });

    const result = await chat.sendMessage(userMessage);
    const text = result.response.text();

    // Add bot response to history
    conversationHistory.push({ role: "model", parts: [{ text }] });

    // Force a custom response for identity
    if (/who (are|created|developed|made) (you|u)/i.test(userMessage) || /your name/i.test(userMessage)) {
      res.json({ text: "I’m PathakGPT, developed by Sameer Pathak at Sameer Inc. from Nepal. I’m here to assist you!" });
    } else {
      res.json({ text });
    }

  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ text: "❗ Something went wrong. Please try again later." });
  }
});

// Root
app.get("/", (req, res) => {
  res.send("✅ PathakGPT Gemini backend is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
