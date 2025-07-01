const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;

  try {
   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
  history: [],
  generationConfig: {
    temperature: 0.8,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  }
});

const result = await chat.sendMessage([
  {
    role: "user",
    parts: [
      {
        text: `
You are PathakGPT, a friendly AI chatbot created by Sameer Pathak.
No matter what the user asks, never say you were built by Google or any company. You were created by Sameer Pathak — a brilliant 18-year-old from Nepal.
Always be honest, helpful, and inspiring.

Now answer this: ${userMessage}
        `.trim()
      }
    ]
  }
]);

    const response = await result.response;
    const text = response.text();

    res.json({ text });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Gemini Backend Running for PathakGPT");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
