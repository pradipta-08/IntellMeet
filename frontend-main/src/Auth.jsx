import React, { useState } from "react";

import api from "./services/api";

import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Auth = () => {

  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  // ========================================
  // LOGIN FUNCTION
  // ========================================
  const handleLogin = async () => {

    try {

      const response = await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      console.log(response.data);


      // SAVE TOKEN
      localStorage.setItem(
        "token",
        response.data.accessToken || response.data.token
      );


      alert("Login Successful");


      // REDIRECT TO DASHBOARD
      navigate("/dashboard");

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Login Failed"
      );
    }
  };


  // ========================================
  // SIGNUP FUNCTION
  // ========================================
  const handleSignup = async () => {

    try {

      const response = await api.post(
        "/auth/signup",
        {
          name,
          email,
          password,
        }
      );

      console.log(response.data);

      alert("Signup Successful");


      // AUTO LOGIN AFTER SIGNUP
      const token = response.data.accessToken || response.data.token;
      if (token) {

        localStorage.setItem(
          "token",
          token
        );

        navigate("/dashboard");

      } else {

        setIsLogin(true);
      }

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        "Signup Failed"
      );
    }
  };


  return (

    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">

      <div className="w-full max-w-md bg-[#1e293b] border border-slate-800 rounded-3xl p-8 shadow-2xl">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-white text-center mb-2">

          {isLogin
            ? "Welcome Back"
            : "Create Account"}

        </h1>


        {/* SUBTITLE */}
        <p className="text-slate-400 text-center text-sm mb-8">

          IntellMeet Enterprise Access

        </p>


        {/* FORM */}
        <div className="space-y-4">

          {/* NAME INPUT */}
          {!isLogin && (

            <input
              type="text"

              placeholder="Full Name"

              value={name}

              onChange={(e) =>
                setName(e.target.value)
              }

              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}


          {/* EMAIL INPUT */}
          <input
            type="email"

            placeholder="Email Address"

            value={email}

            onChange={(e) =>
              setEmail(e.target.value)
            }

            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />


          {/* PASSWORD INPUT */}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3 pr-10 text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>


          {/* SUBMIT BUTTON */}
          <button
            onClick={
              isLogin
                ? handleLogin
                : handleSignup
            }

            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
          >

            {isLogin ? "Login" : "Sign Up"}

          </button>

        </div>


        {/* TOGGLE LOGIN/SIGNUP */}
        <button
          onClick={() =>
            setIsLogin(!isLogin)
          }

          className="w-full text-slate-400 text-sm mt-6 hover:text-white transition"
        >

          {isLogin
            ? "Need an account? Sign Up"
            : "Have an account? Login"}

        </button>

      </div>

    </div>
  );
};

export default Auth;