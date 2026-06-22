import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, MessageSquare, LogOut, FileText } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(loggedInUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div className="p-8 text-center text-slate-500">Loading...</div>;

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
              {user.role.replace('ROLE_', '')}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium transition-colors">
            <Calendar size={20} />
            Appointments
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <MessageSquare size={20} />
            Consultations
          </button>
          {user.role === 'ROLE_PATIENT' && (
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
              <FileText size={20} />
              My Medical Chart
            </button>
          )}
          {user.role === 'ROLE_DOCTOR' && (
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
              <User size={20} />
              Patients
            </button>
          )}
        </nav>

        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors mt-auto border border-red-100">
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Upcoming Appointments</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dummy Appointment Card */}
          <div className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
            <div className="flex justify-between items-start mb-4 pl-2">
              <div>
                <p className="text-xs font-bold text-blue-600 mb-1">TODAY, 10:00 AM</p>
                <h4 className="font-semibold text-slate-800">General Checkup</h4>
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Confirmed</span>
            </div>
            <div className="flex items-center gap-3 pl-2 mt-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                DR
              </div>
              <p className="text-sm text-slate-600 font-medium">Dr. Smith</p>
            </div>
            <button className="mt-5 w-full py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-600 hover:text-white transition-colors">
              Join Consultation
            </button>
          </div>
          
          {/* Add more cards here dynamically later */}
        </div>
      </div>
    </div>
  );
}
