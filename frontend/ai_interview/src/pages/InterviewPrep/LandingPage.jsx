import React, { useState } from 'react';
import { APP_FEATURES } from "../../utils/data";
import { useNavigate } from 'react-router-dom';
import Login from '../Auth/Login';
import Modal from '../../components/Modal';
import SgnUp from '../Auth/SgnUp';

const LandingPage = () => {
  const navigate = useNavigate();
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState("Login");

  const handleCTA = () => {
    const token = sessionStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    } else {
      setCurrentPage("Login");
      setOpenAuthModal(true);
    }
  };

  return (
    <>
      {/* ── HERO SECTION ── */}
      <div
        className="w-full min-h-screen relative overflow-hidden"
        style={{ backgroundColor: "#117c6f" }}
      >
        {/* Orange circle top left */}
        <div
          className="absolute -top-16 -left-16 w-56 h-56 rounded-full"
          style={{ backgroundColor: "#f5a623" }}
        />

        {/* Red circle bottom right */}
        <div
          className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full flex items-end justify-end"
          style={{ backgroundColor: "#e8463a" }}
        >
          <span className="text-white text-4xl mb-6 mr-6">✦</span>
        </div>

        <div className="container mx-auto px-6 pt-6 pb-20 relative z-10 max-w-6xl">

          {/* Navbar */}
          <header className="flex justify-between items-center mb-20">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#f5a623" }}
              >
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-xl text-white font-bold tracking-tight">
                NexInterview
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setCurrentPage("Login");
                  setOpenAuthModal(true);
                }}
                className="text-sm font-medium text-white cursor-pointer transition-colors px-4 py-2 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setCurrentPage("SgnUp");
                  setOpenAuthModal(true);
                }}
                className="text-sm font-semibold text-white px-6 py-2.5 rounded-full cursor-pointer transition-all hover:opacity-90 shadow-lg"
                style={{ backgroundColor: "#f5a623" }}
              >
                Sign Up 
              </button>
            </div>
          </header>

          {/* Hero Content */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-12 md:gap-20 my-12 md:my-16">

            {/* Left Side */}
            <div className="w-full md:w-[50%] flex flex-col items-start text-left">
              <div
                className="flex items-center gap-2 text-[10px] font-extrabold px-3 py-1 rounded-full border mb-6 uppercase tracking-wider text-white"
                style={{
                  backgroundColor: "rgba(245,166,35,0.2)",
                  borderColor: "rgba(245,166,35,0.4)",
                  color: "#f5a623",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: "#f5a623" }}
                />
                AI Powered
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.1] mb-6 text-white">
                Ace Interviews with <br />
                <span
                  className="font-semibold"
                  style={{ color: "#f5a623" }}
                >
                  AI-Powered
                </span>{" "}
                Learning
              </h1>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                {[
                  { value: "10K+", label: "Questions Generated" },
                  { value: "95%", label: "Success Rate" },
                  { value: "50+", label: "Job Roles" },
                ].map((stat, i) => (
                  <div key={i} className="text-left">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "#f5a623" }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side */}
            <div className="w-full md:w-[42%] flex flex-col items-start text-left md:pt-14">
              <p
                className="text-[15px] md:text-[16px] leading-[1.65] mb-8 font-light"
                style={{ color: "rgba(255,255,255,0.8)" }}
              >
                Get role-specific questions, expand answers when you need them,
                dive deeper into concepts, and organize everything your way,
                from preparation to mastery — your ultimate interview toolkit is
                here.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleCTA}
                  className="text-xs font-bold text-white px-8 py-3 rounded-full transition-all duration-300 cursor-pointer uppercase tracking-wider shadow-xl hover:opacity-90"
                  style={{ backgroundColor: "#f5a623" }}
                >
                  Get Started 🚀
                </button>
              
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div
        className="w-full py-20"
        style={{ backgroundColor: "#0e6b5e" }}
      >
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <span
              className="text-xs font-semibold px-4 py-1.5 rounded-full text-white"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              How It Works
            </span>
            <h2 className="text-3xl font-normal text-white mt-4 mb-3 tracking-tight">
              Simple. Fast. Effective.
            </h2>
            <p
              className="max-w-xl mx-auto"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              Get started in minutes and be interview-ready in days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                icon: "🎯",
                title: "Choose Your Role",
                desc: "Select your target job role, experience level, and topics to focus on.",
              },
              {
                step: "02",
                icon: "🤖",
                title: "AI Generates Questions",
                desc: "Our AI instantly generates role-specific technical questions and detailed answers.",
              },
              {
                step: "03",
                icon: "📊",
                title: "Practice & Get Feedback",
                desc: "Answer with text or voice, get scored, and receive detailed improvement tips.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative text-center p-6 rounded-2xl"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <div
                  className="text-xs font-bold mb-3"
                  style={{ color: "#f5a623" }}
                >
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {item.desc}
                </p>
                {i < 2 && (
                  <div
                    className="hidden md:block absolute top-12 right-0 text-2xl"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES SECTION ── */}
      <div
        className="w-full py-20"
        style={{ backgroundColor: "#117c6f" }}
      >
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <span
              className="text-xs font-semibold px-4 py-1.5 rounded-full text-white"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              Features
            </span>
            <h2 className="text-3xl font-normal text-white mt-4 mb-3 tracking-tight">
              Features That Make You Shine
            </h2>
            <p
              className="max-w-xl mx-auto"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              Packed with powerful features to make your interview prep
              effective and fun.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            {/* First 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {APP_FEATURES.slice(0, 3).map((feature) => (
                <div
                  key={feature.id}
                  className="p-7 rounded-xl hover:-translate-y-1 transition-all duration-300 border"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderColor: "rgba(255,255,255,0.12)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(245,166,35,0.25)" }}
                  >
                    <span className="text-xl">{feature.icon || "✨"}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Remaining 2 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {APP_FEATURES.slice(3).map((feature) => (
                <div
                  key={feature.id}
                  className="p-7 rounded-xl hover:-translate-y-1 transition-all duration-300 border"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderColor: "rgba(255,255,255,0.12)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(245,166,35,0.25)" }}
                  >
                    <span className="text-xl">{feature.icon || "✨"}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA BANNER ── */}
      <div
        className="w-full py-16"
        style={{ backgroundColor: "#e8463a" }}
      >
        <div className="container mx-auto px-6 text-center">
          <div className="text-4xl mb-4">✦</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p
            className="mb-8 text-lg max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            Join thousands of developers who aced their interviews with
            NexInterview.
          </p>
          <button
            onClick={handleCTA}
            className="font-bold px-10 py-4 rounded-full cursor-pointer shadow-xl text-base transition-all hover:opacity-90 text-white"
            style={{ backgroundColor: "#f5a623" }}
          >
            Start Practicing Now
          </button>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div
        className="w-full py-8"
        style={{ backgroundColor: "#0a5449" }}
      >
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: "#f5a623" }}
            >
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="text-white font-bold">NexInterview</span>
          </div>
          <p
            className="text-sm"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            © 2026 NexInterview
          </p>
        </div>
      </div>

      {/* Auth Modal */}
      <Modal
        isopen={openAuthModal}
        onClose={() => {
          setOpenAuthModal(false);
          setCurrentPage("Login");
        }}
        hideheader
      >
        <div>
          {currentPage === "Login" && (
            <Login setCurrentPage={setCurrentPage} />
          )}
          {currentPage === "SgnUp" && (
            <SgnUp setCurrentPage={setCurrentPage} />
          )}
        </div>
      </Modal>
    </>
  );
};

export default LandingPage;