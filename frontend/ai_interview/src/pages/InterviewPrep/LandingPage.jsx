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
      <div className="w-full min-h-full bg-[#fffcef]">

        <div className="w-125 h-125 bg-amber-200/20 blur-[65px] absolute top-0 left-0"></div>

        <div className="container mx-auto px-4 pt-6 pb-50 relative z-10">

          {/* header */}
          <header className="flex justify-between items-center mb-16">
            <div className="text-xl text-black font-bold">NexInterview</div>

            <button
              className="bg-linear-to-r from-[#ff9393] to-[#e99a4b] text-sm font-semibold text-white px-7 py-2.5 rounded-full hover:bg-black hover:text-white border border-white transition-colors cursor-pointer"
              onClick={() => {
                navigate("/login");
              }}
            >
              Login / Sign Up
            </button>
          </header>

          {/* hero content */}
          <div className="flex flex-col md:flex-row items-center">

            <div className="w-full md:w-1/2 pr-4 mb-8 md:mb-0">
              <div className="flex items-center justify-left mb-2">
                <div className="flex items-center gap-2 text-[13px] text-amber-600 font-semibold bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                  AI Powered
                </div>
              </div>

              <h1 className="text-5xl text-black font-medium mb-6 leading-tight">
                Ace Interviews with <br />
                <span className="text-transparent bg-clip-text bg-[radial-gradient(circle,#ff9324_0%,#fcd760_100%)] bg-[length-200%_200%] animate-text-shine font-semibold">
                  AI-Powered
                </span>{" "}
                Learning
              </h1>
            </div>

            <div className="w-full md:w-1/2">
              <p className="text-[17px] text-gray-900 mr-0 md:mr-20 mb-6">
                Get role-specific questions, expand answers when you need them,
                dive deeper into concepts, and organize everything your way,
                from preparation to mastery — your ultimate interview toolkit is
                here.
              </p>

              <button
                className="bg-black text-sm font-semibold text-white px-7 py-2.5 rounded-full hover:bg-yellow-100 hover:text-black border border-yellow-50 hover:border-yellow-300 transition-colors cursor-pointer"
                onClick={handleCTA}
              >
                Get Started
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full min-h-full bg-[#fffcef] mt-10">
        <div className="container mx-auto px-4 pt-10 pb-20">
          <section className="mt-5">
            <h2 className="text-2xl font-medium text-center mb-12">
              Features That Make You Shine
            </h2>

            <div className="flex flex-col items-center gap-8">
              {/* First 3 cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                {APP_FEATURES.slice(0, 3).map((feature) => (
                  <div
                    key={feature.id}
                    className="bg-[#fffef8] p-6 rounded-xl shadow-xs hover:shadow-lg shadow-amber-100 transition border border-amber-100"
                  >
                    <h3 className="text-base font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Remaining 2 cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {APP_FEATURES.slice(3).map((feature) => (
                  <div
                    key={feature.id}
                    className="bg-[#fffef8] p-6 rounded-xl shadow-xs hover:shadow-lg shadow-amber-100 transition border border-amber-100"
                  >
                    <h3 className="text-base font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
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