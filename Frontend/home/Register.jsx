import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaCircleCheck , FaCircleXmark } from "react-icons/fa6";

axios.defaults.withCredentials = true;

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  const register = async () => {
    if (!username || !password || !confirmPassword) {
      setMsg("Please fill all fields");
      setIsError(true);
      return;
    }

    if (password.length<5){
      setMsg("Password is weak");
      setIsError(true);
      return;
    }

    if (password !== confirmPassword) {
      setMsg("Password mismatch");
      setIsError(true);
      return;
    }

    try {
      await axios.post("http://localhost:5000/register", {
        username,
        password,
      });

      setMsg("Registered successfully");
      setIsError(false);

      setTimeout(() => navigate("/"), 800);
    } catch {
      setMsg("Registration failed");
      setIsError(true);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
      <div className="w-[320px] rounded-lg bg-gray-700 p-6 text-center shadow-lg">
        <h1 className="mb-6 text-2xl font-semibold text-white">Register</h1>

        <input
          className="mb-4 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input type="password"
          className="mb-4 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input type="password"
          className="mb-4 w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Re-enter Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}/>

        <button onClick={register}
          className="w-full rounded bg-green-600 py-2 font-semibold text-white transition hover:bg-green-700">Register</button>

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

        <p className="mt-4 text-sm text-gray-200">Already a user?{" "}
          <a href="/" className="text-blue-300 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}
