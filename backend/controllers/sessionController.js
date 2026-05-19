const Session = require("../models/Session");
const Question = require("../models/Question");
const Groq = require("groq-sdk");
const { generateQuestionsPrompt } = require("../utils/prompts");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const createSession = async (req, res) => {
  try {
    const { role, experience, tpoicToFocus, description } = req.body;

    console.log("Body received:", req.body);

    if (!role || !experience || !tpoicToFocus) {
      return res.status(400).json({ message: "Role, experience and topic to focus are required." });
    }

    const prompt = generateQuestionsPrompt(role, experience, tpoicToFocus, description);

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content;
    const cleanedResponse = responseText.replace(/```json|```/g, "").trim();
    const generatedQuestions = JSON.parse(cleanedResponse);

    const session = await Session.create({
      user: req.user._id,
      role,
      experience,
      tpoicToFocus,
      description: description || null,
      questions: [],
    });

    const questionDocs = await Promise.all(
      generatedQuestions.map((q) =>
        Question.create({
          session: session._id,
          question: q.question,
          answer: q.answer,
        })
      )
    );

    session.questions = questionDocs.map((q) => q._id);
    await session.save();

    res.status(201).json({
      session,
      questions: questionDocs,
    });

  } catch (error) {
    console.error("Create session error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Get sessions error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate("questions");
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized." });
    }
    res.status(200).json(session);
  } catch (error) {
    console.error("Get session error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized." });
    }
    await Question.deleteMany({ session: req.params.id });
    await Session.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Session deleted successfully." });
  } catch (error) {
    console.error("Delete session error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSession, getUserSessions, getSessionById, deleteSession };