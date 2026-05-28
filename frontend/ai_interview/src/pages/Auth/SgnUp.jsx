import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Input from '../../components/Inputs/Input';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import { UserContext } from '../../context/UserContext';

const SgnUp = ({ setCurrentPage }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Countdown timer logic for Resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resendTimer]);

  // Request the OTP to be sent to the mobile phone
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error("Please enter your mobile number.");
      return;
    }
    if (phoneNumber.trim().length < 10) {
      toast.error("Please enter a valid mobile number (e.g. +91XXXXXXXXXX).");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (!academicYear.trim()) {
      toast.error("Please enter your academic year.");
      return;
    }
    if (!registrationNo.trim()) {
      toast.error("Please enter your registration number.");
      return;
    }
    if (!gender.trim()) {
      toast.error("Please enter your gender.");
      return;
    }
    if (!bloodGroup.trim()) {
      toast.error("Please enter your blood group.");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter your address.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.SEND_OTP, {
        email,
        phoneNumber,
        type: "signup"
      });

      toast.success(response.data.message || "Verification code sent to your phone!");
      
      setShowOtpScreen(true);
      setResendTimer(60); // Enable resend after 60 seconds

    } catch (error) {
      console.error("Send OTP error:", error);
      toast.error(error.response?.data?.message || "Failed to send verification code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Perform full registration with the verified OTP
  const handleSgnUp = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6 || isNaN(otp)) {
      toast.error("Please enter a valid 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name,
        email,
        phoneNumber,
        password,
        academicYear,
        registrationNo,
        gender,
        bloodGroup,
        address,
        otp
      });

      const { token, ...userData } = response.data;

      sessionStorage.setItem("token", token);
      updateUser(userData);

      toast.success("Mobile number verified and account created successfully!");
      navigate("/dashboard");

    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format timer into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Floating 3D Card Styling (Rich split pane layout matching screenshot)
  const cardSplitStyle = "w-[90vw] md:w-[75vw] lg:w-[62vw] flex flex-col md:flex-row bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] relative overflow-hidden transition-all duration-300";

  const renderWrapper = (card) => {
    if (!setCurrentPage) {
      return (
        <div className="w-full min-h-screen bg-[#a6c4bc] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Abstract Yellow Top-Left Shape */}
          <div className="w-[60vw] h-[60vw] md:w-[32rem] md:h-[32rem] bg-[#f5a623] rounded-full absolute -top-[30vw] -left-[30vw] md:-top-64 md:-left-64 pointer-events-none opacity-95"></div>
          {/* Abstract Red Bottom-Right Shape */}
          <div className="w-[60vw] h-[60vw] md:w-[32rem] md:h-[32rem] bg-[#d93c3c] rounded-full absolute -bottom-[30vw] -right-[30vw] md:-bottom-64 md:-right-64 pointer-events-none opacity-95"></div>
          
          <div className="z-10 w-full flex justify-center">
            {card}
          </div>
        </div>
      );
    }
    return card;
  };

  // Left Sidebar Muted Teal Section matching user screenshot
  const renderLeftSidebar = () => (
    <div className="w-full md:w-[38%] bg-[#51b29a] p-8 flex flex-col items-center justify-between text-center relative overflow-hidden shrink-0 min-h-[220px] md:min-h-[420px] rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl">
      {/* Abstract yellow glow */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#f5a623]/25 rounded-full blur-xl pointer-events-none" />
      
      {/* Welcome details */}
      <div className="my-auto space-y-4 relative z-10">
        <h2 className="text-2xl font-medium tracking-tight text-slate-800">
          Welcome To
        </h2>
        <h1 className="text-3xl font-extrabold text-[#f5a623] tracking-wider uppercase drop-shadow-sm">
          NEXINTERVIEW
        </h1>
        <p className="text-sm text-white font-medium leading-relaxed max-w-[200px] mx-auto">
          Ai generated smart interview preparation
        </p>
      </div>

      {/* Home button matching screenshot */}
      <button
        type="button"
        onClick={() => navigate ? navigate("/") : (window.location.href = "/")}
        className="bg-[#f0ad4e] hover:bg-[#e59b34] text-white text-xs font-bold px-8 py-2 rounded-full border-2 border-white shadow-[0_4px_12px_rgba(240,173,78,0.3)] transition transform hover:scale-[1.03] active:scale-95 z-10 uppercase mt-4 select-none cursor-pointer"
      >
        Home
      </button>
    </div>
  );

  // ----------------------------------------------------
  // FLOW A: OTP CODE VERIFICATION SCREEN
  // ----------------------------------------------------
  if (showOtpScreen) {
    return renderWrapper(
      <div className={cardSplitStyle}>
        {renderLeftSidebar()}
        
        {/* Right Form Pane */}
        <div className="flex-1 bg-white p-8 flex flex-col justify-center relative">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-medium text-slate-800 tracking-tight">Verify Your Number</h2>
            <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide">
              Code sent to: <strong className="text-slate-700 break-all">{phoneNumber}</strong>
            </p>
          </div>

          <form onSubmit={handleSgnUp} className="space-y-4">
            <div className="flex flex-col items-center">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={({ target }) => setOtp(target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center text-2xl font-extrabold py-1.5 border-2 border-slate-200 rounded-xl focus:border-[#51b29a] focus:outline-none tracking-[0.5em] pl-[0.5em] bg-slate-50 placeholder-slate-300 transition duration-200"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="flex flex-col items-center pt-2">
              <button
                type="submit"
                className="bg-[#51b29a] hover:bg-[#409b84] text-white text-sm font-bold px-8 py-2.5 rounded-full cursor-pointer shadow-[0_4px_12px_rgba(81,178,154,0.3)] transition transform hover:scale-105 active:scale-95 disabled:opacity-50 select-none uppercase tracking-wide"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Sign Up"}
              </button>
            </div>

            <div className="text-center mt-4">
              {resendTimer > 0 ? (
                <p className="text-xs text-slate-500">
                  Resend code in <span className="font-semibold text-slate-800">{formatTime(resendTimer)}</span>
                </p>
              ) : (
                <button
                  type="button"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition"
                  onClick={() => handleRequestOtp()}
                  disabled={loading}
                >
                  Resend Verification Code
                </button>
              )}
            </div>

            <button
              type="button"
              className="w-full text-xs font-medium text-slate-400 hover:text-slate-700 mt-2 text-center"
              onClick={() => {
                setShowOtpScreen(false);
                setOtp("");
              }}
              disabled={loading}
            >
              ← Back to edit details
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FLOW B: DEFAULT SIGNUP FORM
  // ----------------------------------------------------
  return renderWrapper(
    <div className={cardSplitStyle}>
      {renderLeftSidebar()}
      
      {/* Right Form Pane */}
      <div className="flex-1 bg-white p-8 flex flex-col justify-center relative overflow-y-auto max-h-[90vh] custom-scrollbar py-6">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-medium text-slate-800 tracking-tight">Create an Account</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">Enter your details below to get started</p>
        </div>

        <form onSubmit={handleRequestOtp}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2">
            <div className="md:col-span-2">
              <Input
                value={name}
                onChange={({ target }) => setName(target.value)}
                label="Full Name"
                placeholder=""
                type="text"
                disabled={loading}
              />
            </div>
            <div>
              <Input
                value={email}
                onChange={({ target }) => setEmail(target.value)}
                label="Email Address"
                placeholder="name@gmail.com"
                type="text"
                disabled={loading}
              />
            </div>
            <div>
              <Input
                value={phoneNumber}
                onChange={({ target }) => setPhoneNumber(target.value)}
                label="Mobile Number"
                placeholder="+91XXXXXXXXXX"
                type="text"
                disabled={loading}
              />
            </div>
            <div>
              <Input
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                label="Password"
                placeholder=""
                type="password"
                disabled={loading}
              />
            </div>
            <div>
              <Input
                value={academicYear}
                onChange={({ target }) => setAcademicYear(target.value)}
                label="Academic Year"
                placeholder=""
                type="text"
                disabled={loading}
              />
            </div>
            <div>
              <Input
                value={registrationNo}
                onChange={({ target }) => setRegistrationNo(target.value)}
                label="Registration No."
                placeholder=""
                type="text"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gender</label>
              <div className="input-box">
                <select
                  value={gender}
                  onChange={({ target }) => setGender(target.value)}
                  disabled={loading}
                  className="w-full bg-transparent outline-none cursor-pointer text-slate-700 text-sm"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Blood Group</label>
              <div className="input-box">
                <select
                  value={bloodGroup}
                  onChange={({ target }) => setBloodGroup(target.value)}
                  disabled={loading}
                  className="w-full bg-transparent outline-none cursor-pointer text-slate-700 text-sm"
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
            </div>
            <div className="md:col-span-2">
              <Input
                value={address}
                onChange={({ target }) => setAddress(target.value)}
                label="Address"
                placeholder=""
                type="text"
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2 flex flex-col items-center pt-3">
              <button
                type="submit"
                className="bg-[#51b29a] hover:bg-[#409b84] text-white text-sm font-bold px-8 py-2.5 rounded-full cursor-pointer shadow-[0_4px_12px_rgba(81,178,154,0.3)] transition transform hover:scale-105 active:scale-95 disabled:opacity-50 select-none uppercase tracking-wide"
                disabled={loading}
              >
                {loading ? "Sending Code..." : "Continue & Send OTP"}
              </button>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs text-slate-500 mt-4 text-center">
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-bold text-[#51b29a] hover:text-[#409b84] underline cursor-pointer transition"
                  onClick={() => {
                    if (setCurrentPage) {
                      setCurrentPage("Login");
                    } else {
                      navigate("/login");
                    }
                  }}
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SgnUp;