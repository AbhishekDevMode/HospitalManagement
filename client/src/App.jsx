import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans">
        <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <span className="bg-blue-600 text-white p-1 rounded-lg">
             
              <img
                className="h-10 w-auto object-contain transition-transform duration-200 hover:scale-105"
                src="https://media.istockphoto.com/id/1338748000/photo/green-led-cross-on-a-pharmacy-wall.jpg?s=2048x2048&w=is&k=20&c=6w4Bs-HLAhVKTbVDcpcWWZd3V_xF8646xCawPw9ckfU="
                alt="Company Home"
              />
            </span>{" "}
            CareConnect
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
