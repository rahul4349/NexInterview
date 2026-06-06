import React, { useState } from 'react'
import HERO_PNG from "../../assets/hero.png";
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
    navigate("/login"); // ← always redirect directly to /login page
  };

  return (
    <>
      <div className="w-full min-h-screen bg-transparent relative overflow-hidden">

        {/* Subtle decorative top-left glow */}
        <div className="w-96 h-96 bg-amber-200/20 rounded-full blur-[90px] absolute -top-20 -left-20 pointer-events-none"></div>

        <div className="container mx-auto px-6 pt-6 pb-24 relative z-10 max-w-6xl">

          {/* header */}
          <header className="flex justify-between items-center mb-20">
            <div className="text-xl text-black font-bold tracking-tight">NexInterview</div>

            <button
              className="bg-gradient-to-r from-[#ff8fa3] to-[#ff9e7d] text-sm font-semibold text-white px-7 py-2.5 rounded-full hover:opacity-90 transition-all duration-300 shadow-[0_4px_15px_rgba(255,143,147,0.3)] border border-white/10 cursor-pointer"
              onClick={() => {
                navigate("/login");
              }}
            >
              Login / Sign Up
            </button>
          </header>

          {/* hero content */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-12 md:gap-20 my-12 md:my-16">

            {/* Left Side: Badge and Heading */}
            <div className="w-full md:w-[50%] flex flex-col items-start text-left">
              <div className="flex items-center gap-2 text-[10px] text-[#ff8e28] font-extrabold bg-[#fff2e2] px-3 py-0.5 rounded-full border border-[#ffcf9c] mb-6 select-none uppercase tracking-wider">
                AI Powered
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#0f172a] font-normal tracking-tight leading-[1.1] mb-6">
                Ace Interviews with <br />
                <span className="text-[#ffb948] font-semibold">AI-Powered</span> Learning
              </h1>
            </div>

            {/* Right Side: Copy and CTA */}
            <div className="w-full md:w-[42%] flex flex-col items-start text-left md:pt-14">
              <p className="text-[15px] md:text-[16px] text-[#475569] leading-[1.65] mb-8 font-light">
                Get role-specific questions, expand answers when you need them,
                dive deeper into concepts, and organize everything your way,
                from preparation to mastery — your ultimate interview toolkit is
                here.
              </p>

              <button
                className="bg-black text-xs font-bold text-white px-8 py-3 rounded-full hover:bg-amber-500 hover:text-black transition-all duration-300 transform hover:scale-[1.03] active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.1)] cursor-pointer uppercase tracking-wider"
                onClick={handleCTA}
              >
                Get Started
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-transparent pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <section>
            <h2 className="text-2xl md:text-3xl font-normal text-center text-[#0f172a] mb-12 tracking-tight">
              Features That Make You Shine
            </h2>

            <div className="flex flex-col items-center gap-8">
              {/* First 3 cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {APP_FEATURES.slice(0, 3).map((feature) => (
                  <div
                    key={feature.id}
                    className="bg-[#fffef8] p-7 rounded-xl shadow-[0_10px_35px_rgba(253,230,138,0.06)] hover:shadow-[0_15px_40px_rgba(253,230,138,0.15)] hover:-translate-y-1 transition-all duration-300 border border-slate-800"
                  >
                    <h3 className="text-base font-semibold text-[#0f172a] mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
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
                    className="bg-[#fffef8] p-7 rounded-xl shadow-[0_10px_35px_rgba(253,230,138,0.06)] hover:shadow-[0_15px_40px_rgba(253,230,138,0.15)] hover:-translate-y-1 transition-all duration-300 border border-slate-800"
                  >
                    <h3 className="text-base font-semibold text-[#0f172a] mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
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