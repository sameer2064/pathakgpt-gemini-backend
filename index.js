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

    // Send a single prompt without history to avoid memory issues
    const prompt = `
You are PathakGPT, an AI chatbot developed by Sameer Pathak at Sameer Inc. from Nepal. 
If anyone asks "who created you", "who developed you", or "who are you", always reply:
"I am PathakGPT, developed by Sameer Pathak at Sameer Inc. from Nepal."

Reply to this message: "${userMessage}"
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    res.json({ text });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ text: "❗ Sorry.PathakGPT is experiencing heavy loads. Please try again later." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ PathakGPT Gemini backend is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
