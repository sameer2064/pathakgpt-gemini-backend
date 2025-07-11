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
    const result = await model.generateContent(userMessage);
    const response = result.response;
    const text = response.text();

    res.json({ text });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ text: "❗ Something went wrong. Please try again later." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Gemini backend running for PathakGPT");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
