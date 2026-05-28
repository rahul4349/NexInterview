import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { LuPin, LuPinOff, LuChevronDown, LuChevronUp, LuSparkles } from "react-icons/lu";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";

const InterviewPrep = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);
  const [explanation, setExplanation] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(null);

  // Fetch session by ID
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.SESSION.GET_BY_ID(sessionId));
        setSession(res.data);
        setQuestions(res.data.questions || []);
      } catch (err) {
        toast.error("Failed to fetch session.");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  // Toggle accordion
  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Toggle pin question
  const handlePin = async (questionId) => {
    try {
      const res = await axiosInstance.put(API_PATHS.QUESTION.PIN(questionId));
      setQuestions(questions.map((q) =>
        q._id === questionId ? res.data.question : q
      ));
      toast.success(res.data.message);
    } catch (err) {
      toast.error("Failed to pin question.");
    }
  };

  // Update note
  const handleNoteUpdate = async (questionId, note) => {
    try {
      await axiosInstance.put(API_PATHS.QUESTION.UPDATE_NOTE(questionId), { note });
      toast.success("Note saved!");
    } catch (err) {
      toast.error("Failed to save note.");
    }
  };

  // Get AI explanation
  const fetchExplanation = async (index, concept) => {
    setLoadingExplanation(index);
    try {
      const res = await axiosInstance.post(API_PATHS.AI.GENERATE_EXPLANATION, {
        concept,
      });
      setExplanation((prev) => ({ ...prev, [index]: res.data.explanation }));
    } catch (err) {
      toast.error("Failed to get explanation.");
    } finally {
      setLoadingExplanation(null);
    }
  };

  // Sort — pinned first
  const sortedQuestions = [
    ...questions.filter((q) => q.isPinned),
    ...questions.filter((q) => !q.isPinned),
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#fffcef]">
      <div className="flex items-center justify-between px-8 py-4 border-b border-amber-100 bg-white">
        <h1 className="text-xl font-bold text-black">NexInterview</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-slate-600 hover:underline cursor-pointer flex items-center gap-1"
        >
          ← Back
        </button>
      </div>
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-center animate-pulse">
          <div className="text-5xl mb-4">🤖</div>
          <p className="text-slate-500 font-medium">Loading your session...</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fffcef]">

      {/* Navbar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-amber-100 bg-white">
        <h1 className="text-xl font-bold text-black">NexInterview</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-slate-600 hover:underline cursor-pointer flex items-center gap-1"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Session Info */}
        {session && (
          <div className="bg-white border border-amber-100 rounded-xl p-5 mb-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-black">{session.role}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {session.experience} experience
                </p>
                <p className="text-sm text-slate-500">
                  {session.tpoicToFocus}
                </p>
                {session.description && (
                  <p className="text-sm text-slate-400 mt-2">
                    {session.description}
                  </p>
                )}
              </div>
              <span className="text-xs bg-amber-100 text-amber-600 px-3 py-1 rounded-full">
                {sortedQuestions.length} Questions
              </span>
            </div>
          </div>
        )}

        {/* Questions Accordion */}
        <h3 className="text-lg font-semibold text-black mb-4">
          Interview Questions
        </h3>

        {sortedQuestions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500">No questions found for this session.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedQuestions.map((q, index) => (
              <div
                key={q._id}
                className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${
                  q.isPinned
                    ? "border-amber-300"
                    : "border-amber-100"
                }`}
              >
                {/* Question Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => toggleAccordion(index)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {q.isPinned && (
                      <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full shrink-0">
                        📌 Pinned
                      </span>
                    )}
                    <p className="text-sm font-medium text-black">
                      {q.question}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    {/* Pin Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePin(q._id);
                      }}
                      className={`cursor-pointer transition-colors ${
                        q.isPinned
                          ? "text-amber-500 hover:text-amber-700"
                          : "text-slate-400 hover:text-amber-500"
                      }`}
                    >
                      {q.isPinned ? (
                        <LuPinOff size={16} />
                      ) : (
                        <LuPin size={16} />
                      )}
                    </button>

                    {/* Accordion Arrow */}
                    <span className="text-slate-400">
                      {openIndex === index ? (
                        <LuChevronUp size={18} />
                      ) : (
                        <LuChevronDown size={18} />
                      )}
                    </span>
                  </div>
                </div>

                {/* Answer */}
                {openIndex === index && (
                  <div className="px-4 pb-4 border-t border-gray-50">

                    {/* Answer Text */}
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold text-slate-500 mb-2">
                        Answer:
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {q.answer}
                      </p>
                    </div>

                    {/* AI Explanation */}
                    {explanation[index] && (
                      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-4">
                        <h4 className="text-xs font-semibold text-amber-600 mb-2 flex items-center gap-1">
                          <LuSparkles size={14} /> AI Explanation
                        </h4>
                        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                          {explanation[index]}
                        </p>
                      </div>
                    )}

                    {/* Get AI Explanation Button */}
                    <button
                      onClick={() => fetchExplanation(index, q.question)}
                      disabled={loadingExplanation === index}
                      className="mt-3 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 underline cursor-pointer disabled:opacity-50"
                    >
                      <LuSparkles size={12} />
                      {loadingExplanation === index
                        ? "Getting explanation..."
                        : "Get AI Explanation"}
                    </button>

                    {/* Note */}
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-slate-500 mb-1">
                        Your Note:
                      </h4>
                      <textarea
                        className="w-full mt-1 text-sm text-slate-700 bg-gray-50 rounded-lg p-3 outline-none border border-gray-100 focus:border-amber-300 resize-none custom-scrollbar"
                        rows={2}
                        defaultValue={q.note || ""}
                        placeholder="Add a note..."
                        onBlur={(e) => handleNoteUpdate(q._id, e.target.value)}
                      />
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default InterviewPrep;