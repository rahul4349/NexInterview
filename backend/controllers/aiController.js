const Groq = require("groq-sdk");
const { generateQuestionsPrompt, conceptExplainPrompt } = require("../utils/prompts");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, tpoicToFocus, description } = req.body;  // ← tpoicToFocus

    console.log("Body:", req.body);

    if (!role || !experience || !tpoicToFocus) {
      return res.status(400).json({ message: "Role, experience and topics are required." });
    }

    const prompt = generateQuestionsPrompt(role, experience, tpoicToFocus, description);

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content;
    const cleanedResponse = responseText.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(cleanedResponse);

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