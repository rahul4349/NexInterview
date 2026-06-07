const Groq = require("groq-sdk");
const { generateQuestionsPrompt, conceptExplainPrompt } = require("../utils/prompts");
const { getFallbackQuestions } = require("../utils/fallbacks");

const apiKey = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "your_groq_api_key" ? process.env.GROQ_API_KEY : "dummy_groq_api_key";
const groq = new Groq({ apiKey });

const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, tpoicToFocus, description, questionCount } = req.body;

    console.log("Body:", req.body);

    if (!role || !experience || !tpoicToFocus) {
      return res.status(400).json({ message: "Role, experience and topics are required." });
    }

    let questions;
    try {
      const prompt = generateQuestionsPrompt(role, experience, tpoicToFocus, description, questionCount);

      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
      });

      const responseText = completion.choices[0].message.content;
      const startIndex = responseText.indexOf("[");
      const endIndex = responseText.lastIndexOf("]");
      if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
        throw new Error("No JSON array found in completion content.");
      }
      const jsonString = responseText.substring(startIndex, endIndex + 1);
      questions = JSON.parse(jsonString);
    } catch (apiError) {
      console.warn("Groq API failed, using fallback questions:", apiError.message);
      questions = getFallbackQuestions(role, experience, tpoicToFocus, questionCount);
    }

    res.status(200).json({ questions });

  } catch (error) {
    console.error("Generate questions error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const generateConceptExplanation = async (req, res) => {
  try {
    const { concept } = req.body;

    if (!concept) {
      return res.status(400).json({ message: "Concept is required." });
    }

    const prompt = conceptExplainPrompt(concept);

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    const explanation = completion.choices[0].message.content;

    res.status(200).json({ explanation });

  } catch (error) {
    console.error("Generate explanation error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation };