const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let conversationHistory = [];

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) return res.status(400).json({ text: "❗ Invalid input." });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    });

    conversationHistory.push({ role: "user", parts: [{ text: userMessage }] });

    const result = await chat.sendMessage(userMessage);
    const text = result.response.text();

    conversationHistory.push({ role: "model", parts: [{ text }] });

    // Override response for identity
    if (/who (are|created|developed|made) (you|u)/i.test(userMessage) || /your name/i.test(userMessage)) {
      return res.json({ text: "I am PathakGPT, developed by Sameer Pathak at Sameer Inc. from Nepal." });
    }

    res.json({ text });
  } catch (err) {
    console.error("❗ Gemini API error:", err.message, err);
    res.status(500).json({ text: "❗ Something went wrong. Please try again later." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ PathakGPT Gemini backend is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
