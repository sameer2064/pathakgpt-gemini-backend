const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyBhhL5KgVLuQCRPEh7_WU0XCwB6U8LwdcE");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const result = await model.generateContent(userMessage);
    const response = result.response;
    const text = response.text();

    if (!text) {
      return res.json({ text: "❗ I couldn't generate a response." });
    }

    res.json({ text });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ text: "❗ Something went wrong. Please try again later." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ PathakGPT Gemini backend is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
