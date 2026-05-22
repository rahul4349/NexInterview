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

    if (!forgotPhone.trim()) {
      toast.error("Please enter your registered mobile number.");
      return;
    }
    if (forgotPhone.trim().length < 10) {
      toast.error("Please enter a valid mobile number (e.g. +91XXXXXXXXXX).");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.SEND_OTP, {
        phoneNumber: forgotPhone,
        type: "forgot-password"
      });

      toast.success("Password reset code sent successfully!");

      setForgotFlow("verify");
      setResendTimer(60);

    } catch (error) {
      console.error("Forgot OTP request error:", error);
      toast.error(error.response?.data?.message || "Failed to send reset code. Verify number.");
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
        phoneNumber: forgotPhone,
        otp: forgotOtp,
        newPassword
      });

      toast.success(response.data.message || "Password updated! You can now log in.");
      
      // Reset forms and return to standard login
      setIdentifier(forgotPhone);
      setForgotFlow("none");
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
  const card3DStyle = "w-[90vw] md:w-[33vw] p-8 flex flex-col justify-center bg-[#fffdf6] border border-amber-100/50 rounded-2xl shadow-[0_20px_40px_rgba(255,147,36,0.06),_0_0_0_1px_rgba(255,147,36,0.05),_inset_0_1px_2px_rgba(255,255,255,0.8)] hover:shadow-[0_30px_60px_rgba(255,147,36,0.12)] hover:-translate-y-1 hover:scale-[1.005] transition-all duration-300 relative overflow-hidden";
  const btn3DStyle = "w-full flex items-center justify-center gap-3 text-sm font-bold text-white bg-linear-to-r from-primary to-[#e99a4b] px-5 py-3.5 rounded-xl border-b-4 border-[#c76e0a] hover:border-b-2 hover:translate-y-[2px] active:border-b-0 active:translate-y-[4px] transition-all duration-150 shadow-[0_8px_20px_rgba(255,147,36,0.2)] cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0 disabled:border-b-4";
  const btn3DIndigoStyle = "w-full flex items-center justify-center gap-3 text-sm font-bold text-white bg-linear-to-r from-indigo-500 to-indigo-600 px-5 py-3.5 rounded-xl border-b-4 border-indigo-700 hover:border-b-2 hover:translate-y-[2px] active:border-b-0 active:translate-y-[4px] transition-all duration-150 shadow-[0_8px_20px_rgba(79,70,229,0.2)] cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0 disabled:border-b-4";

  // Decorative ambient glows inside the card
  const cardDecorations = (
    <>
      <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-primary/15 to-transparent blur-xl pointer-events-none"></div>
      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-linear-to-tr from-[#e99a4b]/8 to-transparent blur-xl pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-0.75 bg-linear-to-r from-primary to-[#e99a4b]"></div>
    </>
  );

  const renderWrapper = (card) => {
    if (!setCurrentPage) {
      return (
        <div className="w-full min-h-screen bg-[#fffcef] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className="w-96 h-96 bg-amber-200/20 blur-[80px] absolute -top-10 -left-10 rounded-full pointer-events-none"></div>
          <div className="w-96 h-96 bg-rose-200/20 blur-[80px] absolute -bottom-10 -right-10 rounded-full pointer-events-none"></div>
          
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
            <div className="text-xl font-bold text-slate-800 cursor-pointer select-none" onClick={() => navigate("/")}>
              NexInterview
            </div>
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white border border-slate-200/60 px-4 py-2 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.03)] cursor-pointer transition duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>

          <div className="z-10 mt-16 md:mt-0">
            {card}
          </div>
        </div>
      );
    }
    return card;
  };

  // ----------------------------------------------------
  // FLOW 1: REQUEST FORGOT PASSWORD OTP
  // ----------------------------------------------------
  if (forgotFlow === "request") {
    return renderWrapper(
      <div className={card3DStyle}>
        {cardDecorations}
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2">Forgot Password?</h3>
        <p className="text-xs text-slate-600 mt-2 mb-6 leading-relaxed">
          Enter your registered mobile number below to receive a password reset verification code.
        </p>

        <form onSubmit={handleRequestResetOtp}>
          <div className="grid grid-cols-1 gap-4">
            <Input
              value={forgotPhone}
              onChange={({ target }) => setForgotPhone(target.value)}
              label="Registered Mobile Number"
              placeholder="+91XXXXXXXXXX"
              type="text"
              disabled={loading}
            />

            <button type="submit" className={btn3DIndigoStyle} disabled={loading}>
              {loading ? "Sending Code..." : "SEND VERIFICATION CODE"}
            </button>

            <button
              type="button"
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 hover:underline text-center cursor-pointer mt-2 transition"
              onClick={() => {
                setForgotFlow("none");
                setForgotPhone("");
              }}
              disabled={loading}
            >
              ← Back to Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------
  // FLOW 2: VERIFY RESET OTP & ENTER NEW PASSWORD
  // ----------------------------------------------------
  if (forgotFlow === "verify") {
    return renderWrapper(
      <div className={card3DStyle}>
        {cardDecorations}
        <div className="text-center mb-6 mt-2">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Reset Password</h3>
          <p className="text-sm text-slate-500 mt-2">
            Verification code sent to: <br />
            <strong className="text-slate-800 break-all">{forgotPhone}</strong>
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="flex flex-col items-center mb-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Enter 6-Digit Code
            </label>
            <input
              type="text"
              maxLength="6"
              value={forgotOtp}
              onChange={({ target }) => setForgotOtp(target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full text-center text-3xl font-extrabold py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none tracking-[0.5em] pl-[0.5em] bg-slate-50 placeholder-slate-300 transition duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Input
              value={newPassword}
              onChange={({ target }) => setNewPassword(target.value)}
              label="New Password"
              placeholder="Min 6 characters"
              type="password"
              disabled={loading}
            />
            <Input
              value={confirmPassword}
              onChange={({ target }) => setConfirmPassword(target.value)}
              label="Confirm New Password"
              placeholder="Must match exactly"
              type="password"
              disabled={loading}
            />
          </div>

          <button type="submit" className={btn3DIndigoStyle} disabled={loading}>
            {loading ? "Updating..." : "RESET PASSWORD & CONFIRM"}
          </button>

          <div className="text-center mt-4">
            {resendTimer > 0 ? (
              <p className="text-xs text-slate-500">
                Resend code in <span className="font-semibold text-slate-800">{formatTime(resendTimer)}</span>
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
            className="w-full text-xs font-medium text-slate-500 hover:text-slate-800 mt-2 text-center"
            onClick={() => {
              setForgotFlow("request");
              setForgotOtp("");
              setNewPassword("");
              setConfirmPassword("");
            }}
            disabled={loading}
          >
            ← Back to mobile number
          </button>
        </form>
      </div>
    );
  }

  // ----------------------------------------------------
  // FLOW 3: TRADITIONAL LOGIN (EMAIL OR MOBILE)
  // ----------------------------------------------------
  return renderWrapper(
    <div className={card3DStyle}>
      {cardDecorations}
      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2">Welcome Back</h3>
      <p className="text-xs text-slate-600 mt-2 mb-6">
        Please enter your details to login
      </p>

      <form onSubmit={handlelogin}>
        <div className="grid grid-cols-1 gap-2">
          <Input
            value={identifier}
            onChange={({ target }) => { setIdentifier(target.value); setErrorMsg(""); }}
            label="Email Address or Mobile Number"
            placeholder="name@gmail.com or +91XXXXXXXXXX"
            type="text"
            disabled={loading}
          />
          
          <div className="relative">
            <Input
              value={password}
              onChange={({ target }) => { setPassword(target.value); setErrorMsg(""); }}
              label="Password"
              placeholder="min 6 characters"
              type="password"
              disabled={loading}
            />
            <div className="flex justify-end mt-1 mb-2">
              <button
                type="button"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer transition"
                onClick={() => setForgotFlow("request")}
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 mb-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl shadow-[inset_0_1px_2px_rgba(225,29,72,0.05)] transition-all animate-pulse">
              <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <button type="submit" className={btn3DStyle} disabled={loading}>
            {loading ? "Logging in..." : "LOGIN"}
          </button>

          <p className="text-[13px] text-slate-600 mt-4 text-center">
            Don't have an account?{" "}
            <button
              type="button"
              className="font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer transition"
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
        </div>
      </form>
    </div>
  );
};

export default Login;