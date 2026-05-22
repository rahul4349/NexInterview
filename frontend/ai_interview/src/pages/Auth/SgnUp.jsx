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
        otp
      });

      const { token, ...userData } = response.data;

      localStorage.setItem("token", token);
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

  // Floating 3D Card Styling (Rich hover scaling and elevations)
  const card3DStyle = "w-[90vw] md:w-[33vw] p-8 flex flex-col justify-center bg-[#fffdf6] border border-amber-100/50 rounded-2xl shadow-[0_20px_40px_rgba(255,147,36,0.06),_0_0_0_1px_rgba(255,147,36,0.05),_inset_0_1px_2px_rgba(255,255,255,0.8)] hover:shadow-[0_30px_60px_rgba(255,147,36,0.12)] hover:-translate-y-1 hover:scale-[1.005] transition-all duration-300 relative overflow-hidden";
  const btn3DStyle = "w-full flex items-center justify-center gap-3 text-sm font-bold text-white bg-gradient-to-r from-[#ff9324] to-[#e99a4b] px-5 py-3.5 rounded-xl border-b-4 border-[#c76e0a] hover:border-b-2 hover:translate-y-[2px] active:border-b-0 active:translate-y-[4px] transition-all duration-150 shadow-[0_8px_20px_rgba(255,147,36,0.2)] cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0 disabled:border-b-4";

  // Decorative ambient glows inside the card
  const cardDecorations = (
    <>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#ff9324]/15 to-transparent blur-xl pointer-events-none"></div>
      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-tr from-[#e99a4b]/8 to-transparent blur-xl pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#ff9324] to-[#e99a4b]"></div>
    </>
  );

  // ----------------------------------------------------
  // FLOW A: OTP CODE VERIFICATION SCREEN
  // ----------------------------------------------------
  if (showOtpScreen) {
    return (
      <div className={card3DStyle}>
        {cardDecorations}
        <div className="text-center mb-6">
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Verify Your Number</h3>
          <p className="text-sm text-slate-500 mt-2">
            We've sent a 6-digit verification code to <br />
            <strong className="text-slate-800 break-all">{phoneNumber}</strong>
          </p>
        </div>

        <form onSubmit={handleSgnUp} className="space-y-4">
          <div className="flex flex-col items-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Enter 6-Digit Code
            </label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={({ target }) => setOtp(target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full text-center text-3xl font-extrabold py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none tracking-[0.5em] pl-[0.5em] bg-slate-50 placeholder-slate-300 transition duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
              disabled={loading}
              autoFocus
            />
          </div>

          <button type="submit" className={btn3DStyle} disabled={loading}>
            {loading ? "Verifying..." : "VERIFY & SIGN UP"}
          </button>

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
            className="w-full text-xs font-medium text-slate-500 hover:text-slate-800 mt-2 text-center"
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
    );
  }

  // ----------------------------------------------------
  // FLOW B: DEFAULT SIGNUP FORM
  // ----------------------------------------------------
  return (
    <div className={card3DStyle}>
      {cardDecorations}
      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Create an Account</h3>
      <p className="text-xs text-slate-600 mt-2 mb-6">Enter your details below to get started</p>

      <form onSubmit={handleRequestOtp}>
        <div className="grid grid-cols-1 gap-2">
          <Input
            value={name}
            onChange={({ target }) => setName(target.value)}
            label="Full Name"
            placeholder="Name"
            type="text"
            disabled={loading}
          />
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="name@gmail.com"
            type="text"
            disabled={loading}
          />
          <Input
            value={phoneNumber}
            onChange={({ target }) => setPhoneNumber(target.value)}
            label="Mobile Number"
            placeholder="+91XXXXXXXXXX"
            type="text"
            disabled={loading}
          />
          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="min 6 characters"
            type="password"
            disabled={loading}
          />

          <button type="submit" className={`${btn3DStyle} mt-4`} disabled={loading}>
            {loading ? "Sending verification code..." : "CONTINUE & SEND OTP"}
          </button>

          <p className="text-[13px] text-slate-600 mt-4 text-center">
            Already have an account?{" "}
            <button
              type="button"
              className="font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer transition"
              onClick={() => setCurrentPage("Login")}
            >
              Login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SgnUp;