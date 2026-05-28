import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Input from '../../components/Inputs/Input';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import { UserContext } from '../../context/UserContext';

const Login = ({ setCurrentPage }) => {
  // Login states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Forgot password states
  const [forgotFlow, setForgotFlow] = useState("none"); // "none", "request", "verify"
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  // Countdown timer logic for Resend OTP in Forgot Password flow
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

  // Handle standard login
  const handlelogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!identifier.trim()) {
      setErrorMsg("Please enter your email or mobile number.");
      toast.error("Please enter your email or mobile number.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      toast.error("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        identifier,
        password,
      });

      const { token, ...userData } = response.data;

      sessionStorage.setItem("token", token);
      updateUser(userData);

      toast.success("Login successful!");
      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);
      const msg = error.response?.data?.message || "Invalid email/mobile or password. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle requesting a password reset OTP
  const handleRequestResetOtp = async (e) => {
    if (e) e.preventDefault();

    if (!forgotIdentifier.trim()) {
      toast.error("Please enter your registered Email or Mobile number.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.SEND_OTP, {
        identifier: forgotIdentifier,
        type: "forgot-password"
      });

      toast.success("Password reset code sent successfully!");

      // Save the resolved phone number returned from the backend
      setForgotPhone(response.data.phoneNumber);
      setForgotFlow("verify");
      setResendTimer(60);

    } catch (error) {
      console.error("Forgot OTP request error:", error);
      toast.error(error.response?.data?.message || "Failed to send reset code. Verify details.");
    } finally {
      setLoading(false);
    }
  };

  // Handle verifying OTP and resetting password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!forgotOtp || forgotOtp.length !== 6 || isNaN(forgotOtp)) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD, {
        identifier: forgotIdentifier,
        otp: forgotOtp,
        newPassword
      });

      toast.success(response.data.message || "Password updated! You can now log in.");
      
      // Reset forms and return to standard login
      setIdentifier(forgotIdentifier);
      setForgotFlow("none");
      setForgotIdentifier("");
      setForgotPhone("");
      setForgotOtp("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error.response?.data?.message || "Failed to reset password. Please check OTP.");
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

  // Floating 3D Card Styling (Rich hover scaling and elevations)
  // Floating 3D Card Styling (Rich split pane layout matching screenshot)
  const cardSplitStyle = "w-[90vw] md:w-[65vw] lg:w-[52vw] flex flex-col md:flex-row bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] relative overflow-hidden transition-all duration-300";

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
  // FLOW 1: REQUEST FORGOT PASSWORD OTP
  // ----------------------------------------------------
  if (forgotFlow === "request") {
    return renderWrapper(
      <div className={cardSplitStyle}>
        {renderLeftSidebar()}
        
        {/* Right Form Pane */}
        <div className="flex-1 bg-white p-8 flex flex-col justify-center relative">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-medium text-slate-800 tracking-tight">Forgot Password?</h2>
            <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide">Enter registered details below</p>
          </div>

          <form onSubmit={handleRequestResetOtp} className="space-y-4">
            <div className="space-y-3">
              {/* Identifier Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={({ target }) => setForgotIdentifier(target.value)}
                  className="w-full bg-[#e6e8e7] text-sm text-slate-700 rounded-[10px] pl-10 pr-4 py-3 border border-transparent outline-none focus:border-[#51b29a] transition placeholder-slate-400"
                  placeholder="Email or Mobile number"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex flex-col items-center pt-2">
              <button
                type="submit"
                className="bg-[#51b29a] hover:bg-[#409b84] text-white text-sm font-bold px-8 py-2.5 rounded-full cursor-pointer shadow-[0_4px_12px_rgba(81,178,154,0.3)] transition transform hover:scale-105 active:scale-95 disabled:opacity-50 select-none uppercase tracking-wide"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Code"}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                className="text-xs font-bold text-slate-400 hover:text-indigo-600 hover:underline cursor-pointer transition"
                onClick={() => {
                  setForgotFlow("none");
                  setForgotIdentifier("");
                  setForgotPhone("");
                }}
                disabled={loading}
              >
                ← Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FLOW 2: VERIFY RESET OTP & ENTER NEW PASSWORD
  // ----------------------------------------------------
  if (forgotFlow === "verify") {
    return renderWrapper(
      <div className={cardSplitStyle}>
        {renderLeftSidebar()}

        {/* Right Form Pane */}
        <div className="flex-1 bg-white p-8 flex flex-col justify-center relative">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Reset Password</h3>
            <p className="text-xs text-slate-400 mt-1">
              Code sent to: <strong className="text-slate-700">{forgotIdentifier}</strong>
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="flex flex-col items-center mb-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength="6"
                value={forgotOtp}
                onChange={({ target }) => setForgotOtp(target.value.replace(/\D/g, ''))}
                placeholder=""
                className="w-full text-center text-2xl font-extrabold py-1.5 border-2 border-slate-200 rounded-xl focus:border-[#51b29a] focus:outline-none tracking-[0.5em] pl-[0.5em] bg-slate-50 placeholder-slate-300 transition duration-200"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="space-y-3">
              {/* New Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={({ target }) => setNewPassword(target.value)}
                  className="w-full bg-[#e6e8e7] text-sm text-slate-700 rounded-[10px] pl-10 pr-4 py-2.5 border border-transparent outline-none focus:border-[#51b29a] transition placeholder-slate-400"
                  placeholder="New Password"
                  required
                  disabled={loading}
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={({ target }) => setConfirmPassword(target.value)}
                  className="w-full bg-[#e6e8e7] text-sm text-slate-700 rounded-[10px] pl-10 pr-4 py-2.5 border border-transparent outline-none focus:border-[#51b29a] transition placeholder-slate-400"
                  placeholder="Confirm Password"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex flex-col items-center pt-2">
              <button
                type="submit"
                className="bg-[#51b29a] hover:bg-[#409b84] text-white text-sm font-bold px-8 py-2.5 rounded-full cursor-pointer shadow-[0_4px_12px_rgba(81,178,154,0.3)] transition transform hover:scale-105 active:scale-95 disabled:opacity-50 select-none uppercase tracking-wide"
                disabled={loading}
              >
                {loading ? "Updating..." : "Confirm Reset"}
              </button>
            </div>

            <div className="text-center mt-2">
              {resendTimer > 0 ? (
                <p className="text-xs text-slate-500">
                  Resend code in <span className="font-semibold text-slate-800">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  onClick={() => handleRequestResetOtp()}
                  disabled={loading}
                >
                  Resend Code
                </button>
              )}
            </div>

            <button
              type="button"
              className="w-full text-xs font-medium text-slate-400 hover:text-slate-700 text-center mt-2"
              onClick={() => {
                setForgotFlow("request");
                setForgotOtp("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              disabled={loading}
            >
              ← Back to request
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // FLOW 3: TRADITIONAL LOGIN (EMAIL OR MOBILE)
  // ----------------------------------------------------
  return renderWrapper(
    <div className={cardSplitStyle}>
      {renderLeftSidebar()}

      {/* Right Form Pane */}
      <div className="flex-1 bg-white p-8 flex flex-col justify-center relative">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-medium text-slate-800 tracking-tight">Login To Account</h2>
          <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide">Registered User Only</p>
        </div>

        <form onSubmit={handlelogin} className="space-y-4">
          <div className="space-y-3">
            {/* User ID Field with Icon */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                value={identifier}
                onChange={({ target }) => { setIdentifier(target.value); setErrorMsg(""); }}
                className="w-full bg-[#e6e8e7] text-sm text-slate-700 rounded-[10px] pl-10 pr-4 py-3 border border-transparent outline-none focus:border-[#51b29a] transition placeholder-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                placeholder="Email or Mobile number"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field with Icon */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={({ target }) => { setPassword(target.value); setErrorMsg(""); }}
                  className="w-full bg-[#e6e8e7] text-sm text-slate-700 rounded-[10px] pl-10 pr-4 py-3 border border-transparent outline-none focus:border-[#51b29a] transition placeholder-slate-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                  placeholder="Password"
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex justify-end mt-1.5 pr-1">
                <button
                  type="button"
                  className="text-[11px] font-bold text-indigo-500 hover:text-indigo-700 hover:underline cursor-pointer transition"
                  onClick={() => setForgotFlow("request")}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl shadow-[inset_0_1px_2px_rgba(225,29,72,0.05)] transition-all animate-pulse">
              <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col items-center pt-2">
            <button
              type="submit"
              className="bg-[#51b29a] hover:bg-[#409b84] text-white text-sm font-bold px-8 py-2.5 rounded-full cursor-pointer shadow-[0_4px_12px_rgba(81,178,154,0.3)] transition transform hover:scale-105 active:scale-95 disabled:opacity-50 select-none uppercase tracking-wide"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4 text-center">
            Don't have an account?{" "}
            <button
              type="button"
              className="font-bold text-[#51b29a] hover:text-[#409b84] underline cursor-pointer transition"
              onClick={() => {
                if (setCurrentPage) {
                  setCurrentPage("SgnUp");
                } else {
                  navigate("/signup");
                }
              }}
            >
              SignUp
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;