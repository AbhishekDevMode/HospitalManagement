import { useState } from "react";
import "./App.css";
import Login from "./components/Login";
import { BrowserRouter ,Routes,Route,Navigate} from "react-router-dom";
import Dashboard from "./components/Dashboard";
function App() {

  return (
  
      <BrowserRouter>
         <div className="min-h-screen bg-slate-50 font-sans">
        <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <span className="bg-blue-600 text-white p-1 rounded-lg">🏥</span> HealthSync
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
