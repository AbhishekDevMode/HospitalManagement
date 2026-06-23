import { useEffect, useState } from "react";
import axios from "axios";
import MedicalChart from "./MedicalChart";
import { User, ChevronRight } from "lucide-react";

export default function PatientsList({ user }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
      const res = await axios.get(`${API_BASE}/api/patients`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-slate-500">Loading patients...</div>;

  if (selectedPatientId) {
    const p = patients.find(p => p.id === selectedPatientId);
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setSelectedPatientId(null)} className="text-blue-600 hover:underline text-sm font-semibold">
            &larr; Back to Patients
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Chart for {p.name}</h2>
        </div>
        <MedicalChart user={user} targetPatientId={selectedPatientId} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">My Patients</h2>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {patients.length === 0 ? (
          <p className="p-6 text-slate-500">No patients found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {patients.map(p => (
              <div key={p.id} onClick={() => setSelectedPatientId(p.id)} className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{p.name}</h4>
                    <p className="text-sm text-slate-500">{p.contactNumber || "No contact info"}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
