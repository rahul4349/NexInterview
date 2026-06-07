require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const Groq = require("groq-sdk");

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const questionRoutes = require("./routes/questionRoutes");
const { protect } = require("./middlewares/authMiddleware");
const { generateInterviewQuestions, generateConceptExplanation } = require("./controllers/aiController");
const { getFallbackFeedback } = require("./utils/fallbacks");

const app = express();
const apiKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "your_groq_api_key" ? process.env.GROQ_API_KEY : "dummy_groq_api_key";
const groq = new Groq({ apiKey });

connectDB();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/question", questionRoutes);

app.post("/api/ai/generate-question", protect, (req, res, next) => {
  console.log("AI route hit!");
  console.log("Body:", req.body);
  next();
}, generateInterviewQuestions);

app.post("/api/ai/generate-explanation", protect, generateConceptExplanation);

// ← new feedback endpoint
app.post("/api/ai/generate-feedback", protect, async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || answers.length === 0) {
      return res.status(400).json({ message: "Answers are required." });
    }

    const prompt = `You are an expert interviewer. Evaluate these interview answers and return feedback.

Questions and Answers:
${answers.map((a, i) => `
Q${i + 1}: ${a.question}
User Answer: ${a.userAnswer || "No answer provided"}
Correct Answer: ${a.correctAnswer}
`).join("\n")}

Return ONLY a valid JSON object with NO extra text, NO markdown, NO explanation:
{
  "overallScore": 75,
  "totalQuestions": ${answers.length},
  "answeredQuestions": 3,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["area 1", "area 2"],
  "questionFeedback": [
    {
      "question": "question text",
      "score": 80,
      "feedback": "feedback text",
      "userAnswer": "user answer"
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
    });

    const responseText = completion.choices[0].message.content;
    const cleanedResponse = responseText.replace(/```json|```/g, "").trim();
    const feedback = JSON.parse(cleanedResponse);

    res.status(200).json(feedback);

  } catch (error) {
    console.warn("Groq Feedback generation failed, using fallback feedback:", error.message);
    try {
      const fallbackFeedback = getFallbackFeedback(answers);
      res.status(200).json(fallbackFeedback);
    } catch (fallbackError) {
      console.error("Fallback feedback error:", fallbackError.message);
      res.status(500).json({ message: "Failed to generate feedback." });
    }
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});