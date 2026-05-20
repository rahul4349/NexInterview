import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import { UserContext } from "../../context/UserContext";

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
  "Android Developer",
  "iOS Developer",
  "Database Administrator",
  "Cloud Engineer",
  "Cybersecurity Engineer",
  "QA Engineer",
  "Product Manager",
  "Business Analyst",
];

const EXPERIENCE_LEVELS = [
  "Fresher (0-1 year)",
  "Junior (1-2 years)",
  "Mid (2-4 years)",
  "Senior (4-7 years)",
  "Lead (7+ years)",
];

const Dashboard = () => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [experience, setExperience] = useState("");
  const [topicToFocus, setTopicToFocus] = useState("");
  const [description, setDescription] = useState("");
  const [questionCount, setQuestionCount] = useState(10);  // ← added
  const [creating, setCreating] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.SESSION.GET_ALL);
      setSessions(res.data);
    } catch (err) {
      toast.error("Failed to fetch sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateSession = async (e) => {
    e.preventDefault();

    const finalRole = customRole || role;

    if (!finalRole || !experience || !topicToFocus) {
      toast.error("Role, experience and topic are required.");
      return;
    }

    setCreating(true);

    try {
      const res = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
        role: finalRole,
        experience,
        tpoicToFocus: topicToFocus,
        description,
        questionCount,   // ← added
      });

      toast.success("Session created successfully!");
      setSessions([res.data.session, ...sessions]);
      setShowCreate(false);
      setRole("");
      setCustomRole("");
      setExperience("");
      setTopicToFocus("");
      setDescription("");
      setQuestionCount(10);
      navigate(`/interviewprep/${res.data.session._id}`);

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create session.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await axiosInstance.delete(API_PATHS.SESSION.DELETE(id));
      setSessions(sessions.filter((s) => s._id !== id));
      toast.success("Session deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete session.");
    }
  };

  const handleLogout = () => {
    clearUser();
    navigate("/");
    toast.success("Logged out successfully!");
  };

  return (
    <div className="min-h-screen bg-[#fffcef]">

      {/* Navbar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-amber-100 bg-white">
        <h1 className="text-xl font-bold text-black">NexInterview</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-sm font-semibold text-amber-700">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-slate-600">Hi, {user?.name} 👋</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-600 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">My Sessions 🎯</h2>
            <p className="text-slate-500 text-sm mt-1">
              Create a session to generate AI interview questions
            </p>
          </div>
          <div className="flex gap-3">
            {/* Practice Mode Button */}
            <button
              onClick={() => navigate("/practice")}
              className="bg-amber-500 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-amber-600 transition-colors cursor-pointer"
            >
              🎯 Practice Mode
            </button>
            {/* New Session Button */}
            <button
              onClick={() => setShowCreate(true)}
              className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-amber-500 transition-colors cursor-pointer"
            >
              + New Session
            </button>
          </div>
        </div>

        {/* Create Session Form */}
        {showCreate && (
          <div className="bg-white border border-amber-100 rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-black mb-4">
              Create New Session
            </h3>
            <form onSubmit={handleCreateSession}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Role Dropdown */}
                <div>
                  <label className="text-[13px] text-slate-800">Job Role</label>
                  <select
                    className="w-full bg-gray-50 text-sm text-slate-700 rounded px-4 py-3 mb-2 mt-3 border border-gray-100 outline-none focus:border-orange-300 cursor-pointer"
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
                      className="w-full bg-gray-50 text-sm text-slate-700 rounded px-4 py-3 border border-gray-100 outline-none focus:border-orange-300"
                      value={customRole}
                      onChange={({ target }) => setCustomRole(target.value)}
                    />
                  )}
                </div>

                {/* Experience Dropdown */}
                <div>
                  <label className="text-[13px] text-slate-800">Experience Level</label>
                  <select
                    className="w-full bg-gray-50 text-sm text-slate-700 rounded px-4 py-3 mb-2 mt-3 border border-gray-100 outline-none focus:border-orange-300 cursor-pointer"
                    value={experience}
                    onChange={({ target }) => setExperience(target.value)}
                  >
                    <option value="">Select experience</option>
                    {EXPERIENCE_LEVELS.map((exp) => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>

                {/* Topics to Focus */}
                <div>
                  <label className="text-[13px] text-slate-800">Topics to Focus</label>
                  <div className="input-box">
                    <input
                      type="text"
                      placeholder="e.g. React, JavaScript, CSS"
                      className="w-full bg-transparent outline-none text-sm"
                      value={topicToFocus}
                      onChange={({ target }) => setTopicToFocus(target.value)}
                    />
                  </div>
                </div>

                {/* Number of Questions */}
                <div>
                  <label className="text-[13px] text-slate-800">Number of Questions</label>
                  <select
                    className="w-full bg-gray-50 text-sm text-slate-700 rounded px-4 py-3 mb-2 mt-3 border border-gray-100 outline-none focus:border-orange-300 cursor-pointer"
                    value={questionCount}
                    onChange={({ target }) => setQuestionCount(Number(target.value))}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                    <option value={25}>25 Questions</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="text-[13px] text-slate-800">Description (optional)</label>
                  <div className="input-box">
                    <input
                      type="text"
                      placeholder="e.g. Preparing for frontend interviews"
                      className="w-full bg-transparent outline-none text-sm"
                      value={description}
                      onChange={({ target }) => setDescription(target.value)}
                    />
                  </div>
                </div>

              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-amber-500 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Generating Questions..." : "Create & Generate Questions"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="text-sm text-slate-600 hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sessions List */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-slate-500">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-slate-500 text-sm">
              No sessions yet. Create one to get started!
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 bg-black text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-amber-500 transition-colors cursor-pointer"
            >
              + Create First Session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((session) => (
              <div
                key={session._id}
                onClick={() => navigate(`/interviewprep/${session._id}`)}
                className="bg-white border border-amber-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-black">
                      {session.role}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {session.experience} experience
                    </p>
                    <p className="text-xs text-slate-500">
                      {session.tpoicToFocus}
                    </p>
                    {session.description && (
                      <p className="text-xs text-slate-400 mt-2">
                        {session.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full">
                    {session.questions?.length || 0} Qs
                  </span>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-400">
                    {new Date(session.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/practice");
                      }}
                      className="text-xs text-amber-500 hover:text-amber-700 cursor-pointer"
                    >
                      🎯 Practice
                    </button>
                    <button
                      onClick={(e) => handleDelete(session._id, e)}
                      className="text-xs text-red-400 hover:text-red-600 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;