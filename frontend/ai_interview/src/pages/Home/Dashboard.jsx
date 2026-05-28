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
  const { user, updateUser, clearUser } = useContext(UserContext);
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

  // Profile Update states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileAcademicYear, setProfileAcademicYear] = useState("");
  const [profileRegNo, setProfileRegNo] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [profileBloodGroup, setProfileBloodGroup] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileOtp, setProfileOtp] = useState("");
  const [profileFlow, setProfileFlow] = useState("edit"); // "edit" or "otp"
  const [profileTimer, setProfileTimer] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = React.useRef(null);
  const profileTimerRef = React.useRef(null);

  // Countdown timer logic for Profile Update verification code
  useEffect(() => {
    if (profileTimer > 0) {
      profileTimerRef.current = setInterval(() => {
        setProfileTimer((prev) => {
          if (prev <= 1) {
            clearInterval(profileTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (profileTimerRef.current) clearInterval(profileTimerRef.current);
    };
  }, [profileTimer]);

  const handleOpenProfile = () => {
    setProfileName(user?.name || "");
    setProfileEmail(user?.email || "");
    setProfilePhone(user?.phoneNumber || "");
    setProfileImageUrl(user?.profileImageUrl || "");
    setProfileAcademicYear(user?.academicYear || "2021-2023");
    setProfileRegNo(user?.registrationNo || "2124100001");
    setProfileGender(user?.gender || "Male");
    setProfileBloodGroup(user?.bloodGroup || "A+");
    setProfileAddress(user?.address || "Near Khantapada High School, Khantapada, Balasore");
    setProfileOtp("");
    setProfileFlow("edit");
    setProfileTimer(0);
    setShowProfileModal(true);
  };

  // Request Profile Update Verification Code (OTP)
  const handleRequestUpdateOtp = async (e) => {
    if (e) e.preventDefault();

    if (!profileName.trim() || !profileEmail.trim() || !profilePhone.trim() || !profileAcademicYear.trim() || !profileRegNo.trim() || !profileGender.trim() || !profileBloodGroup.trim() || !profileAddress.trim()) {
      toast.error("Please fill all profile fields.");
      return;
    }

    setSaving(true);
    try {
      await axiosInstance.post(API_PATHS.AUTH.REQUEST_PROFILE_UPDATE_OTP);
      toast.success("Verification code sent to your registered email!");
      setProfileFlow("otp");
      setProfileTimer(60);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send verification code.");
    } finally {
      setSaving(false);
    }
  };

  // Verify OTP and save profile changes
  const handleVerifyAndUpdateProfile = async (e) => {
    if (e) e.preventDefault();

    if (!profileOtp || profileOtp.length !== 6 || isNaN(profileOtp)) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    setSaving(true);
    try {
      const res = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
        name: profileName,
        email: profileEmail,
        phoneNumber: profilePhone,
        profileImageUrl: profileImageUrl,
        academicYear: profileAcademicYear,
        registrationNo: profileRegNo,
        gender: profileGender,
        bloodGroup: profileBloodGroup,
        address: profileAddress,
        otp: profileOtp
      });

      updateUser(res.data);
      toast.success("Profile updated successfully!");
      setShowProfileModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  // Handle uploading new profile image
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.UPLOAD_IMAGE, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfileImageUrl(res.data.imageUrl);
      toast.success("Profile picture uploaded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

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

  if (showProfileModal) {
    return (
      <div className="fixed inset-0 bg-[#0c2333] z-50 overflow-y-auto flex flex-col items-center justify-start py-8 px-4 relative select-text">
        {/* Abstract Top-Left Accent */}
        <div className="absolute top-0 left-0 w-48 h-16 bg-[#209fa6]/25 -skew-y-12 origin-top-left transform pointer-events-none" />
        {/* Abstract Bottom-Right Accent */}
        <div className="absolute bottom-0 right-0 w-64 h-32 bg-[#209fa6]/25 skew-y-12 origin-bottom-right transform pointer-events-none" />

        {/* Profile Page Header */}
        <div className="w-full max-w-5xl flex items-center justify-between mb-6 relative z-10 px-4 md:px-0">
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-wide">
            Profile Page
          </h1>
          <button
            onClick={() => setShowProfileModal(false)}
            className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full cursor-pointer transition border border-white/20 flex items-center gap-1 select-none"
          >
            ✕ Close
          </button>
        </div>

        {/* Main White Content Card Frame */}
        <div className="w-full max-w-5xl bg-[#f0f2f5] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex overflow-hidden border border-slate-200 relative z-10">
          
          {/* 1. Left Narrow Charcoal Sidebar */}
          <div className="w-14 bg-[#232d37] flex flex-col items-center py-5 justify-between shrink-0 select-none">
            <div className="flex flex-col items-center gap-6 w-full">
              {/* Logo top icon */}
              <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-[10px] font-extrabold text-slate-900 border border-white/20 shadow-sm animate-pulse">
                NI
              </div>
              {/* Navigation Stack */}
              <div className="flex flex-col items-center gap-4 text-slate-400/80">
                <svg className="w-5 h-5 cursor-pointer hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <svg className="w-5 h-5 cursor-pointer hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <svg className="w-5 h-5 cursor-pointer hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <svg className="w-5 h-5 cursor-pointer hover:text-white transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <svg className="w-5 h-5 text-indigo-400 cursor-pointer hover:text-indigo-300 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <svg onClick={() => setShowProfileModal(false)} className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
          </div>

          {/* 2. Right Main Split Pane Content Card */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            
            {/* Profile subheader bar matching screenshot */}
            <div className="h-10 bg-[#e6e8eb] flex items-center px-5 border-b border-slate-200 select-none">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </div>
            </div>

            {/* Grid content split pane */}
            <div className="flex flex-col lg:flex-row min-h-[460px]">
              
              {/* 2a. Left Column (User Card) */}
              <div className="w-full lg:w-[35%] p-8 flex flex-col items-center justify-center text-center shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100">
                
                {/* Circle Profile image */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {profileImageUrl ? (
                    <img 
                      src={profileImageUrl} 
                      alt="Avatar preview" 
                      className="w-36 h-36 rounded-full object-cover border-4 border-amber-100/50 shadow-md group-hover:opacity-85 transition" 
                    />
                  ) : (
                    <div className="w-36 h-36 rounded-full bg-[#fde7d4] border-4 border-white/90 flex items-center justify-center text-4xl font-semibold text-[#e67e22] shadow-md group-hover:opacity-85 transition">
                      {profileName ? profileName.split(" ").map(w => w.charAt(0)).join("").substring(0, 2).toUpperCase() : "AD"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <span className="text-xs text-white font-semibold tracking-wider uppercase">Change</span>
                  </div>
                </div>

                {uploading ? (
                  <span className="text-[11px] text-slate-400 animate-pulse mt-2 block">Uploading Image...</span>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer mt-2"
                    disabled={saving}
                  >
                    Upload Photo
                  </button>
                )}

                <h2 className="text-2xl font-bold text-slate-800 mt-4 leading-tight">
                  {profileName || "Ashutosh Dash"}
                </h2>
                <p className="text-[11px] font-bold text-slate-400 italic uppercase tracking-wider mt-1 select-none">
                  STUDENT
                </p>
                
                <div className="text-xs text-slate-400/80 leading-normal max-w-[260px] mt-3 font-medium select-none">
                  Department of CSA <br />
                  Odisha University of Technology and Research, Ghatikia, Bhubaneswar
                </div>
              </div>

              {/* 2b. Right Column (Details Form) */}
              <div className="flex-1 p-8">
                <h3 className="text-2xl font-medium text-slate-800 mb-6">
                  Details
                </h3>

                {profileFlow === "edit" ? (
                  <form onSubmit={handleRequestUpdateOtp} className="space-y-4">
                    
                    {/* 2x3 Form Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                        <input 
                          type="text"
                          className="w-full bg-[#f1f3f4] text-xs text-slate-700 font-medium border border-transparent rounded px-3 py-2 outline-none focus:border-[#51b29a] transition placeholder-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                          value={profileName}
                          onChange={({ target }) => setProfileName(target.value)}
                          placeholder=""
                          disabled={saving || uploading}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
                        <input 
                          type="email"
                          className="w-full bg-[#f1f3f4] text-xs text-slate-700 font-medium border border-transparent rounded px-3 py-2 outline-none focus:border-[#51b29a] transition placeholder-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                          value={profileEmail}
                          onChange={({ target }) => setProfileEmail(target.value)}
                          placeholder="name@example.com"
                          disabled={saving || uploading}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                        <input 
                          type="text"
                          className="w-full bg-[#f1f3f4] text-xs text-slate-700 font-medium border border-transparent rounded px-3 py-2 outline-none focus:border-[#51b29a] transition placeholder-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                          value={profilePhone}
                          onChange={({ target }) => setProfilePhone(target.value)}
                          placeholder="+91XXXXXXXXXX"
                          disabled={saving || uploading}
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Academic Year</label>
                        <input 
                          type="text"
                          className="w-full bg-[#f1f3f4] text-xs text-slate-700 font-medium border border-transparent rounded px-3 py-2 outline-none focus:border-[#51b29a] transition placeholder-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                          value={profileAcademicYear}
                          onChange={({ target }) => setProfileAcademicYear(target.value)}
                          placeholder=""
                          disabled={saving || uploading}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Registration No.</label>
                        <input 
                          type="text"
                          className="w-full bg-[#f1f3f4] text-xs text-slate-700 font-medium border border-transparent rounded px-3 py-2 outline-none focus:border-[#51b29a] transition placeholder-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                          value={profileRegNo}
                          onChange={({ target }) => setProfileRegNo(target.value)}
                          placeholder=""
                          disabled={saving || uploading}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gender</label>
                        <select
                          className="w-full bg-[#f1f3f4] text-xs text-slate-700 font-medium border border-transparent rounded px-3 py-2.5 outline-none focus:border-[#51b29a] transition cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                          value={profileGender}
                          onChange={({ target }) => setProfileGender(target.value)}
                          disabled={saving || uploading}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Blood Group</label>
                        <select
                          className="w-full bg-[#f1f3f4] text-xs text-slate-700 font-medium border border-transparent rounded px-3 py-2.5 outline-none focus:border-[#51b29a] transition cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                          value={profileBloodGroup}
                          onChange={({ target }) => setProfileBloodGroup(target.value)}
                          disabled={saving || uploading}
                        >
                          <option value="">Select Blood Group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Address</label>
                        <input 
                          type="text"
                          className="w-full bg-[#f1f3f4] text-xs text-slate-700 font-medium border border-transparent rounded px-3 py-2 outline-none focus:border-[#51b29a] transition placeholder-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                          value={profileAddress}
                          onChange={({ target }) => setProfileAddress(target.value)}
                          placeholder=""
                          disabled={saving || uploading}
                        />
                      </div>

                    </div>

                    {/* Request Save Button */}
                    <div className="flex justify-end pt-4">
                      <button 
                        type="submit" 
                        className="bg-[#51b29a] hover:bg-[#409b84] text-white text-xs font-bold px-7 py-2.5 rounded-full cursor-pointer shadow-[0_4px_12px_rgba(81,178,154,0.3)] transition transform hover:scale-105 active:scale-95 disabled:opacity-50 select-none uppercase tracking-wide flex items-center gap-1"
                        disabled={saving || uploading}
                      >
                        {saving ? "Processing..." : "Request Save Code (OTP)"}
                      </button>
                    </div>

                  </form>
                ) : (
                  <form onSubmit={handleVerifyAndUpdateProfile} className="space-y-6">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      To save your profile changes, please enter the 6-digit verification code sent to your registered email address:<br />
                      <strong className="text-slate-700 break-all">{user?.email}</strong>
                    </p>

                    <div className="flex flex-col items-start mb-2 max-w-xs">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Enter 6-Digit Code
                      </label>
                      <input
                        type="text"
                        maxLength="6"
                        value={profileOtp}
                        onChange={({ target }) => setProfileOtp(target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="w-full text-center text-2xl font-extrabold py-2 border-2 border-slate-200 rounded-xl focus:border-[#51b29a] focus:outline-none tracking-[0.5em] pl-[0.5em] bg-slate-50 placeholder-slate-300 transition duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                        disabled={saving}
                        autoFocus
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                      <button 
                        type="submit" 
                        className="bg-[#51b29a] hover:bg-[#409b84] text-white text-xs font-bold px-7 py-2 rounded-full cursor-pointer shadow-[0_4px_12px_rgba(81,178,154,0.3)] transition transform hover:scale-105 active:scale-95 disabled:opacity-50 select-none uppercase tracking-wide"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Verify & Save Profile"}
                      </button>
                      
                      <button
                        type="button"
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
                        onClick={() => {
                          setProfileFlow("edit");
                          setProfileOtp("");
                        }}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="text-left pt-2">
                      {profileTimer > 0 ? (
                        <p className="text-xs text-slate-400 font-medium">
                          Resend code in <span className="font-semibold text-slate-700">{profileTimer}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                          onClick={() => handleRequestUpdateOtp()}
                          disabled={saving}
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </form>
                )}

              </div>

            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffcef]">

      {/* Navbar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-amber-100 bg-white">
        <h1 className="text-xl font-bold text-black">NexInterview</h1>
        <div className="flex items-center gap-6">
          <div 
            onClick={handleOpenProfile}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition select-none group"
            title="View & Edit Profile"
          >
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="profile"
                className="w-8 h-8 rounded-full object-cover border border-amber-100 shadow-sm group-hover:scale-105 transition duration-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-sm font-semibold text-amber-700 shadow-sm group-hover:scale-105 transition duration-200">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm text-slate-600 font-medium group-hover:text-black transition">Hi, {user?.name} 👋</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-red-400 hover:text-red-600 cursor-pointer transition font-medium"
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
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-semibold text-black">
                Create New Session
              </h3>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-sm text-slate-600 hover:underline cursor-pointer flex items-center gap-1 font-medium"
              >
                ← Back
              </button>
            </div>
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