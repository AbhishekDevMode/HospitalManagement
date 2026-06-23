import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, MessageSquare, LogOut, FileText, Plus } from "lucide-react";
import axios from "axios";
import BookAppointmentModal from "./BookAppointmentModal";
import Chat from "./Chat";
import MedicalChart from "./MedicalChart";
import PatientsList from "./PatientsList";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null); // appointmentId
  const [activeTab, setActiveTab] = useState("appointments");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser) {
      navigate("/login");
    } else {
      setUser(JSON.parse(loggedInUser));
    }
  }, [navigate]);

  useEffect(() => {
    if (user && activeTab === "appointments") {
      fetchAppointments();
    }
  }, [user, activeTab]);

  const fetchAppointments = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
      const res = await axios.get(`${API_BASE}/api/appointments`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user)
    return <div className="p-8 text-center text-slate-500">Loading...</div>;

  const renderContent = () => {
    if (activeChat) {
      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Live Consultation</h1>
            <button onClick={() => setActiveChat(null)} className="text-blue-600 font-medium hover:underline">Back</button>
          </div>
          <Chat appointmentId={activeChat} currentUserId={user.id} />
        </div>
      );
    }

    if (activeTab === "appointments") {
      return (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">
              Appointments
            </h1>
            {user.role === "ROLE_PATIENT" && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors">
                <Plus size={18} /> Book Appointment
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.length === 0 ? (
              <p className="text-slate-500 col-span-full">No appointments found.</p>
            ) : (
              appointments.map(apt => (
                <div key={apt.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
                  <div className="flex justify-between items-start mb-4 pl-2">
                    <div>
                      <p className="text-xs font-bold text-blue-600 mb-1">
                        {new Date(apt.startTime).toLocaleString()}
                      </p>
                      <h4 className="font-semibold text-slate-800">
                        {user.role === "ROLE_PATIENT" ? `Dr. ${apt.doctor.name}` : `${apt.patient.name}`}
                      </h4>
                    </div>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded-full uppercase">
                      {apt.status}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveChat(apt.id)}
                    className="mt-5 w-full py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-600 hover:text-white transition-colors">
                    Join Consultation
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      );
    }

    if (activeTab === "charts" && user.role === "ROLE_PATIENT") {
      return <MedicalChart user={user} />;
    }

    if (activeTab === "patients" && user.role === "ROLE_DOCTOR") {
      return <PatientsList user={user} />;
    }

    if (activeTab === "consultations") {
      return (
        <div className="text-center p-8">
          <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Past Consultations</h2>
          <p className="text-slate-500 mt-2">Your past consultation history will appear here.</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 flex gap-8 h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <div className="w-64 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{user.username}</h3>
            <p className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-100 rounded-md inline-block mt-1">
              {user.role.replace("ROLE_", "")}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => { setActiveTab("appointments"); setActiveChat(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "appointments" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
            <Calendar size={20} />
            Appointments
          </button>
          <button 
            onClick={() => { setActiveTab("consultations"); setActiveChat(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "consultations" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
            <MessageSquare size={20} />
            Consultations
          </button>
          {user.role === "ROLE_PATIENT" && (
            <button 
              onClick={() => { setActiveTab("charts"); setActiveChat(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "charts" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
              <FileText size={20} />
              My Medical Chart
            </button>
          )}
          {user.role === "ROLE_DOCTOR" && (
            <button 
              onClick={() => { setActiveTab("patients"); setActiveChat(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === "patients" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
              <User size={20} />
              Patients
            </button>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors mt-auto border border-red-100"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-8 overflow-y-auto">
        {renderContent()}
      </div>

      <BookAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onBooked={fetchAppointments} 
      />
    </div>
  );
};
export default Dashboard;
