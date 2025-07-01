const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatSessions = {};

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message.toLowerCase();
  const sessionId = req.body.sessionId || "default";

  // Check for custom identity questions
  if (
    userMessage.includes("who created you") ||
    userMessage.includes("who developed you") ||
    userMessage.includes("who made you") ||
    userMessage.includes("what is your name") ||
    userMessage.includes("what's your name")
  ) {
    return res.json({
      text: "I am PathakGPT. I was developed by Sameer Pathak at Sameer.Inc from Nepal."
    });
  }

  try {
    if (!chatSessions[sessionId]) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const chat = model.startChat({
        history: [],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });

      chatSessions[sessionId] = chat;
    }

    const chat = chatSessions[sessionId];
    const result = await chat.sendMessage(req.body.message);
    const response = result.response;
    const text = response.text();

    res.json({ text });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Gemini Backend with Memory + Custom Identity Running for PathakGPT");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
