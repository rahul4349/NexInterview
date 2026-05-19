const Question = require("../models/Question");
const Session = require("../models/Session");

// @desc    Toggle pin question
// @route   PUT /api/question/:id/pin
// @access  Private
const togglePinQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    question.isPinned = !question.isPinned;
    await question.save();

    res.status(200).json({
      message: `Question ${question.isPinned ? "pinned" : "unpinned"} successfully.`,
      question,
    });

  } catch (error) {
    console.error("Toggle pin error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update question note
// @route   PUT /api/question/:id/note
// @access  Private
const updateQuestionNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ message: "Note is required." });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { note },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    res.status(200).json({
      message: "Note updated successfully.",
      question,
    });

  } catch (error) {
    console.error("Update note error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add bulk questions to session
// @route   POST /api/question/add-to-session
// @access  Private
const addQuestionsToSession = async (req, res) => {
  try {
    const { sessionId, questions } = req.body;

    if (!sessionId || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Session ID and questions are required." });
    }

    // Create all questions
    const questionDocs = await Promise.all(
      questions.map((q) =>
        Question.create({
          session: sessionId,
          question: q.question,
          answer: q.answer || null,
        })
      )
    );

    // Add questions to session
    await Session.findByIdAndUpdate(sessionId, {
      $push: { questions: { $each: questionDocs.map((q) => q._id) } },
    });

    res.status(201).json({
      message: "Questions added to session successfully.",
      questions: questionDocs,
    });

  } catch (error) {
    console.error("Add questions to session error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  togglePinQuestion,
  updateQuestionNote,
  addQuestionsToSession,
};