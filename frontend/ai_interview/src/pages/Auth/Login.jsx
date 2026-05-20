import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Input from '../../components/Inputs/Input';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPath';
import { UserContext } from '../../context/UserContext';

const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handlelogin = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, ...userData } = response.data;

      localStorage.setItem("token", token);
      updateUser(userData);

      toast.success("Login successful!");
      navigate("/dashboard");

    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center">
      <h3 className="text-lg font-semibold text-black">Welcome Back</h3>
      <p className="text-xs text-slate-700 mt-1.25 mb-6">
        Please enter your details to login
      </p>

      <form onSubmit={handlelogin}>
        <div className="grid grid-cols-1 gap-2">
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="name@gmail.com"
            type="text"
          />
          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="min 6 characters"
            type="password"
          />

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "LOGIN"}
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Don't have an account?{" "}
            <button
              type="button"
              className="font-medium text-primary underline cursor-pointer"
              onClick={() => setCurrentPage("SgnUp")}
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