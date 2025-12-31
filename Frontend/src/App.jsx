import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./home/Login";
import Dashboard from "./Dashboard";
import Register from "./home/Register";
import "./Styles.css";
import './index.css';

function App() {
  return(
  <>
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
  </>
  )
}

export default App;
