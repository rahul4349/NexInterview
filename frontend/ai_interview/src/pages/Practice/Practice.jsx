import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { LuMic, LuMicOff, LuTimer, LuChevronRight } from "react-icons/lu";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "React Developer",
  "Node.js Developer",
  "Python Developer",
  "Java Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "UI/UX Designer",
  "Mobile Developer",
];

const EXPERIENCE_LEVELS = [
  "Fresher (0-1 year)",
  "Junior (1-2 years)",
  "Mid (2-4 years)",
  "Senior (4-7 years)",
  "Lead (7+ years)",
];

const Practice = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("setup");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [experience, setExperience] = useState("");
  const [topicToFocus, setTopicToFocus] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(120);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [useVoice, setUseVoice] = useState(false);

  const timerRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (useVoice && transcript) {
      setAnswer(transcript);
    }
  }, [transcript, useVoice]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (isRunning && timeLeft === 0) {
      handleNext();
    }
    return () => clearTimeout(timerRef.current);
  }, [isRunning, timeLeft]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStart = async () => {
    const finalRole = customRole || role;
    if (!finalRole || !experience || !topicToFocus) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, {
        role: finalRole,
        experience,
        tpoicToFocus: topicToFocus,
        questionCount,
        description: `Generate ${questionCount} questions`,
      });
      const qList = res.data.questions.slice(0, questionCount);
      setQuestions(qList);
      setAnswers(
        qList.map((q) => ({
          question: q.question,
          correctAnswer: q.answer,
          userAnswer: "",
          timeTaken: 0,
        }))
      );
      setTimeLeft(timeLimit);
      setStep("practice");
      setIsRunning(true);
    } catch (err) {
      toast.error("Failed to generate questions. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setAnswer("");
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  const handleNext = () => {
    setIsRunning(false);
    clearTimeout(timerRef.current);
    SpeechRecognition.stopListening();

    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      question: questions[currentIndex]?.question,
      correctAnswer: questions[currentIndex]?.answer,
      userAnswer: answer,
      timeTaken: timeLimit - timeLeft,
    };
    setAnswers(newAnswers);

    if (currentIndex + 1 >= questions.length) {
      generateFeedback(newAnswers);
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setAnswer(newAnswers[nextIndex]?.userAnswer || "");
      resetTranscript();
      setTimeLeft(timeLimit);
      setIsRunning(true);
    }
  };

  const handleGoBack = () => {
    setIsRunning(false);
    clearTimeout(timerRef.current);
    SpeechRecognition.stopListening();

    if (currentIndex === 0) {
      if (window.confirm("Are you sure you want to go back to Setup? Your current session progress will be lost.")) {
        setStep("setup");
        setAnswers([]);
        setCurrentIndex(0);
        setAnswer("");
        setQuestions([]);
      } else {
        setIsRunning(true);
      }
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      question: questions[currentIndex]?.question,
      correctAnswer: questions[currentIndex]?.answer,
      userAnswer: answer,
      timeTaken: timeLimit - timeLeft,
    };
    setAnswers(newAnswers);

    const previousIndex = currentIndex - 1;
    setCurrentIndex(previousIndex);
    setAnswer(newAnswers[previousIndex]?.userAnswer || "");
    resetTranscript();
    setTimeLeft(timeLimit);
    setIsRunning(true);
  };

  const handleSkipInterview = () => {
    setIsRunning(false);
    clearTimeout(timerRef.current);
    SpeechRecognition.stopListening();

    const answeredCount = answers.filter(a => a.userAnswer && a.userAnswer.trim()).length + (answer.trim() ? 1 : 0);
    if (answeredCount === 0) {
      if (window.confirm("You haven't answered any questions yet. Are you sure you want to end the session?")) {
        setStep("setup");
        setAnswers([]);
        setCurrentIndex(0);
        setAnswer("");
        setQuestions([]);
      } else {
        setIsRunning(true);
      }
      return;
    }

    if (window.confirm("Are you sure you want to skip the remaining questions and finish the interview now? We will generate feedback based on your completed answers.")) {
      const finalAnswers = [...answers];
      finalAnswers[currentIndex] = {
        question: questions[currentIndex]?.question,
        correctAnswer: questions[currentIndex]?.answer,
        userAnswer: answer,
        timeTaken: timeLimit - timeLeft,
      };
      setAnswers(finalAnswers);
      generateFeedback(finalAnswers);
    } else {
      setIsRunning(true);
    }
  };
  const generateFeedback = async (allAnswers) => {
    setStep("feedback");
    setLoadingFeedback(true);
    try {
      const res = await axiosInstance.post(API_PATHS.AI.GENERATE_FEEDBACK, {
        answers: allAnswers,
      });
      setFeedback(res.data);
    } catch (err) {
      console.error("Feedback error:", err);
      toast.error("Failed to generate feedback.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleReadQuestion = () => {
    const utterance = new SpeechSynthesisUtterance(
      questions[currentIndex]?.question
    );
    window.speechSynthesis.speak(utterance);
  };

  const progress = questions.length > 0
    ? ((currentIndex) / questions.length) * 100
    : 0;

  // ─── SETUP STEP ───────────────────────────────────────────
  if (step === "setup") {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="flex items-center justify-between px-8 py-4 border-b border-amber-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <h1 className="text-xl font-bold text-black">NexInterview</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-slate-600 hover:underline cursor-pointer"
          >
            ← Back
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-bold text-black mb-2">
            Practice Mode 📚
          </h2>
          <p className="text-slate-500 mb-8">
            Set up your practice session and answer questions with a timer.
          </p>

          <div className="bg-white border border-amber-100 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Role */}
              <div>
                <label className="text-[13px] text-slate-800">Job Role</label>
                <select
                  className="w-full bg-gray-50 text-sm text-slate-700 rounded px-4 py-3 mt-2 border border-gray-100 outline-none focus:border-orange-300 cursor-pointer"
                  value={role}
                  onChange={({ target }) => {
                    setRole(target.value);
                    setCustomRole("");
                  }}
                >
                  <option value="">Select a role</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  <option value="custom">Other (type below)</option>
                </select>
                {role === "custom" && (
                  <input
                    type="text"
                    placeholder="Type your role..."
                    className="w-full bg-gray-50 text-sm rounded px-4 py-3 mt-2 border border-gray-100 outline-none focus:border-orange-300"
                    value={customRole}
                    onChange={({ target }) => setCustomRole(target.value)}
                  />
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="text-[13px] text-slate-800">
                  Experience Level
                </label>
                <select
                  className="w-full bg-gray-50 text-sm text-slate-700 rounded px-4 py-3 mt-2 border border-gray-100 outline-none focus:border-orange-300 cursor-pointer"
                  value={experience}
                  onChange={({ target }) => setExperience(target.value)}
                >
                  <option value="">Select experience</option>
                  {EXPERIENCE_LEVELS.map((exp) => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>

              {/* Topics */}
              <div>
                <label className="text-[13px] text-slate-800">
                  Topics to Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, JavaScript, CSS"
                  className="w-full bg-gray-50 text-sm rounded px-4 py-3 mt-2 border border-gray-100 outline-none focus:border-orange-300"
                  value={topicToFocus}
                  onChange={({ target }) => setTopicToFocus(target.value)}
                />
              </div>

              {/* Question Count */}
              <div>
                <label className="text-[13px] text-slate-800">
                  Number of Questions
                </label>
                <select
                  className="w-full bg-gray-50 text-sm text-slate-700 rounded px-4 py-3 mt-2 border border-gray-100 outline-none focus:border-orange-300 cursor-pointer"
                  value={questionCount}
                  onChange={({ target }) => setQuestionCount(Number(target.value))}
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>

              {/* Time Limit */}
              <div>
                <label className="text-[13px] text-slate-800">
                  Time per Question
                </label>
                <select
                  className="w-full bg-gray-50 text-sm text-slate-700 rounded px-4 py-3 mt-2 border border-gray-100 outline-none focus:border-orange-300 cursor-pointer"
                  value={timeLimit}
                  onChange={({ target }) => setTimeLimit(Number(target.value))}
                >
                  <option value={60}>1 minute</option>
                  <option value={120}>2 minutes</option>
                  <option value={180}>3 minutes</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>

              {/* Input Mode */}
              <div>
                <label className="text-[13px] text-slate-800">
                  Answer Mode
                </label>
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setUseVoice(false)}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium border cursor-pointer transition-colors ${
                      !useVoice
                        ? "bg-black text-white border-black"
                        : "bg-gray-50 text-slate-600 border-gray-100"
                    }`}
                  >
                    ⌨️ Type
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseVoice(true)}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium border cursor-pointer transition-colors ${
                      useVoice
                        ? "bg-black text-white border-black"
                        : "bg-gray-50 text-slate-600 border-gray-100"
                    }`}
                  >
                    🎤 Voice
                  </button>
                </div>
              </div>

            </div>

            <button
              onClick={handleStart}
              disabled={loading}
              className="mt-6 w-full bg-black text-white text-sm font-medium py-3 rounded-full hover:bg-amber-500 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Generating Questions..." : (
                <>Start Practice <LuChevronRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PRACTICE STEP ────────────────────────────────────────
  if (step === "practice") {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="flex items-center justify-between px-8 py-4 border-b border-amber-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <h1 className="text-xl font-bold text-black">NexInterview</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 font-medium">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <button
              onClick={handleSkipInterview}
              className="text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-1.5 rounded-full transition cursor-pointer select-none"
            >
              Skip / End Interview 🏁
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 h-1.5">
          <div
            className="bg-amber-400 h-1.5 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">

          {/* Timer & Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 text-2xl font-bold ${
              timeLeft < 30 ? "text-red-500" : "text-black"
            }`}>
              <LuTimer size={24} />
              {formatTime(timeLeft)}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (isRunning) {
                    setIsRunning(false);
                    SpeechRecognition.stopListening();
                  } else {
                    setIsRunning(true);
                  }
                }}
                className={`text-sm px-4 py-2 rounded-full cursor-pointer transition-colors ${
                  isRunning
                    ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    : "bg-green-600 text-white hover:bg-green-500"
                }`}
              >
                {isRunning ? "⏸️ Pause" : "▶️ Resume"}
              </button>

              <button
                onClick={handleReadQuestion}
                disabled={!isRunning}
                className="text-sm border border-amber-200 bg-amber-50 text-amber-700 px-4 py-2 rounded-full cursor-pointer hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                🔊 Read Question
              </button>

              {browserSupportsSpeechRecognition && useVoice && (
                <button
                  onClick={toggleVoice}
                  disabled={!isRunning}
                  className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full cursor-pointer transition-colors disabled:opacity-50 ${
                    listening
                      ? "bg-red-500 text-white"
                      : "border border-gray-200 text-slate-600 hover:border-amber-300"
                  }`}
                >
                  {listening ? (
                    <><LuMicOff size={16} /> Stop</>
                  ) : (
                    <><LuMic size={16} /> Speak</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Question */}
          <div className="relative bg-white border border-amber-100 rounded-xl p-6 shadow-sm mb-6 min-h-[120px] flex flex-col justify-center">
            {!isRunning && (
              <div className="absolute inset-0 bg-white/90 rounded-xl flex flex-col items-center justify-center z-10 backdrop-blur-[2px]">
                <span className="text-3xl mb-1">⏸️</span>
                <p className="text-sm font-bold text-slate-800">Interview Paused</p>
                <button
                  onClick={() => setIsRunning(true)}
                  className="mt-2 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full cursor-pointer transition shadow-sm"
                >
                  Resume Interview
                </button>
              </div>
            )}
            <div>
              <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                Question {currentIndex + 1}
              </span>
              <p className="text-lg font-medium text-black mt-3 leading-relaxed">
                {questions[currentIndex]?.question}
              </p>
            </div>
          </div>

          {/* Answer Input */}
          <div className="bg-white border border-amber-100 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-black">
                Your Answer:
              </label>
              {useVoice && listening && isRunning && (
                <span className="text-xs text-red-500 animate-pulse">
                  🔴 Recording...
                </span>
              )}
            </div>
            <textarea
              className="w-full bg-gray-50 text-sm text-slate-700 rounded-lg p-4 outline-none border border-gray-100 focus:border-amber-300 resize-none custom-scrollbar"
              rows={6}
              placeholder={
                !isRunning 
                  ? "Interview is paused. Click Resume to write your answer..." 
                  : (useVoice ? "Click Speak and start talking..." : "Type your answer here...")
              }
              value={answer}
              onChange={({ target }) => {
                if (!useVoice && isRunning) setAnswer(target.value);
              }}
              readOnly={useVoice || !isRunning}
            />
          </div>

          {/* Action Buttons Grid */}
          <div className="flex gap-4">
            <button
              onClick={handleGoBack}
              className="flex-1 border border-slate-300 text-slate-700 bg-white/50 hover:bg-white text-sm font-medium py-3 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              ← Go Back
            </button>
            <button
              onClick={handleNext}
              disabled={!isRunning}
              className="flex-1 bg-black text-white text-sm font-medium py-3 rounded-full hover:bg-amber-500 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {currentIndex + 1 >= questions.length
                ? "Finish & Get Feedback 🎯"
                : "Next Question →"}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ─── FEEDBACK STEP ────────────────────────────────────────
  if (step === "feedback") {
    if (loadingFeedback) return (
      <div className="flex items-center justify-center h-screen bg-transparent">
        <div className="text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-slate-500">Analyzing your performance...</p>
        </div>
      </div>
    );

    if (!feedback) return (
      <div className="flex items-center justify-center h-screen bg-transparent">
        <div className="text-center">
          <p className="text-slate-500">Could not generate feedback.</p>
          <button
            onClick={() => setStep("setup")}
            className="mt-4 bg-black text-white text-sm px-6 py-2.5 rounded-full cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-transparent">
        <div className="flex items-center justify-between px-8 py-4 border-b border-amber-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <h1 className="text-xl font-bold text-black">NexInterview</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-slate-600 hover:underline cursor-pointer"
          >
            ← Dashboard
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl font-bold text-black mb-2">
            Your Results 🎯
          </h2>
          <p className="text-slate-500 mb-8">
            Here's how you performed in your practice session.
          </p>

          {/* Score Card */}
          <div className="bg-white border border-amber-100 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row items-center gap-8">

              {/* Circle Score */}
              <div className="relative flex items-center justify-center">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={feedback.overallScore >= 70 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="3"
                    strokeDasharray={`${feedback.overallScore}, 100`}
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-2xl font-bold text-black">
                    {feedback.overallScore}%
                  </div>
                  <div className="text-xs text-slate-500">Score</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 flex-1 text-center">
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-black">
                    {feedback.totalQuestions}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Total Questions
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {feedback.answeredQuestions}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Answered</div>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-red-500">
                    {feedback.totalQuestions - feedback.answeredQuestions}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Skipped</div>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white border border-amber-100 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-black mb-3">✅ Strengths</h3>
              <ul className="flex flex-col gap-2">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-amber-100 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-black mb-3">📈 Areas to Improve</h3>
              <ul className="flex flex-col gap-2">
                {feedback.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question Breakdown */}
          <div className="bg-white border border-amber-100 rounded-xl p-6 shadow-sm mb-6">
            <h3 className="font-semibold text-black mb-4">Question Breakdown</h3>
            <div className="flex flex-col gap-4">
              {feedback.questionFeedback.map((q, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-black flex-1">
                      Q{i + 1}: {q.question}
                    </p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ml-2 shrink-0 ${
                      q.score >= 70
                        ? "bg-green-100 text-green-600"
                        : q.score >= 40
                        ? "bg-amber-100 text-amber-600"
                        : "bg-red-100 text-red-500"
                    }`}>
                      {q.score}%
                    </span>
                  </div>

                  {/* Score Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        q.score >= 70
                          ? "bg-green-400"
                          : q.score >= 40
                          ? "bg-amber-400"
                          : "bg-red-400"
                      }`}
                      style={{ width: `${q.score}%` }}
                    />
                  </div>

                  {/* User Answer */}
                  {q.userAnswer && (
                    <div className="mb-2">
                      <p className="text-xs text-slate-500 font-medium">Your Answer:</p>
                      <p className="text-xs text-slate-600 mt-1">{q.userAnswer}</p>
                    </div>
                  )}

                  {/* Feedback */}
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs text-amber-700">{q.feedback}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setStep("setup");
                setQuestions([]);
                setAnswers([]);
                setCurrentIndex(0);
                setFeedback(null);
                setAnswer("");
              }}
              className="flex-1 bg-black text-white text-sm font-medium py-3 rounded-full hover:bg-amber-500 transition-colors cursor-pointer"
            >
              Practice Again
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 border border-amber-200 text-slate-700 text-sm font-medium py-3 rounded-full hover:bg-amber-50 transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }
};

export default Practice;