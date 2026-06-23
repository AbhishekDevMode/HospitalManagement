import { useEffect, useState } from "react";
import axios from "axios";

export default function MedicalChart({ user, targetPatientId }) {
  const [chart, setChart] = useState({ history: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChart();
  }, [targetPatientId]);

  const fetchChart = async () => {
    setLoading(true);
    try {
      let url = "http://localhost:8081/api/charts/my";
      if (user.role === "ROLE_DOCTOR" && targetPatientId) {
        url = `http://localhost:8081/api/charts/patient/${targetPatientId}`;
      }
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setChart(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (user.role !== "ROLE_DOCTOR" || !targetPatientId) return;
    
    try {
      await axios.post(`http://localhost:8081/api/charts/patient/${targetPatientId}`, { history: chart.history }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save chart");
    }
  };

  if (loading) return <div className="text-slate-500">Loading chart...</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Medical History</h2>
        {user.role === "ROLE_DOCTOR" && targetPatientId && (
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors">
            {isEditing ? "Save Chart" : "Edit Chart"}
          </button>
        )}
      </div>
      
      {isEditing ? (
        <textarea 
          className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={chart?.history || ""}
          onChange={(e) => setChart({...chart, history: e.target.value})}
          placeholder="Enter patient medical history and notes here..."
        />
      ) : (
        <div className="min-h-[16rem] p-4 bg-slate-50 border border-slate-100 rounded-lg whitespace-pre-wrap text-slate-700">
          {chart?.history || "No medical history recorded yet."}
        </div>
      )}
    </div>
  );
}
