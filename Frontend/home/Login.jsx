import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
axios.defaults.withCredentials = true;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  const login = async () => {
    if (!username || !password) {
      setMsg("Please enter username and password");
      setIsError(true);
      return;
    }

    try {
      await axios.post("http://localhost:5000/login", {
        username,
        password,
      });

      setMsg("Login successful");
      setIsError(false);

      setTimeout(() => navigate("/dashboard"), 1000);
    } catch {
      setMsg("Login failed");
      setIsError(true);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
      <div className="w-[320px] rounded-lg bg-gray-700 p-6 text-center shadow-lg">
        <h1 className="mb-6 text-2xl font-semibold text-white">Login</h1>

        <input
          className="mb-4 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="mb-4 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full rounded bg-blue-600 py-2 font-semibold text-white transition hover:bg-blue-700"
        >
          Login
        </button>

        {msg && (
          <div
            className={`mt-4 flex items-center gap-2 rounded p-3 text-sm text-white ${
              isError ? "bg-red-600" : "bg-green-600"
            }`}
          >
            
            {isError ? <FaCircleXmark /> : <FaCircleCheck />}
            <span>{msg}</span>
          </div>
        )}

        {/* <p className="mt-4 text-sm text-gray-200">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-300 hover:underline">Register</a>
        </p> */}
      </div>
    </div>
  );
}