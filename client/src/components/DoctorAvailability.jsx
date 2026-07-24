import { useState, useEffect } from "react";
import axios from "axios";
import { Clock, Calendar, CheckCircle } from "lucide-react";

export default function DoctorAvailability() {
  const [formData, setFormData] = useState({
    workingDays: "1,2,3,4,5",
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30
  });
  
  const [blockedSlot, setBlockedSlot] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: ""
  });

  const [message, setMessage] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

  // In a real app we'd fetch the existing availability here, but for now we'll just use defaults and allow update.

  const handleUpdateAvailability = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/doctors/${user.id}/availability`, formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessage("Availability updated successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockSlot = async (e) => {
    e.preventDefault();
    try {
      const startDateTime = new Date(`${blockedSlot.date}T${blockedSlot.startTime}:00`).toISOString();
      const endDateTime = new Date(`${blockedSlot.date}T${blockedSlot.endTime}:00`).toISOString();
      
      await axios.post(`${API_BASE}/api/doctors/${user.id}/blocked-slots`, {
        startTime: startDateTime,
        endTime: endDateTime,
        reason: blockedSlot.reason
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessage("Slot blocked successfully");
      setBlockedSlot({ date: "", startTime: "", endTime: "", reason: "" });
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {message && (
        <div className="bg-green-100 text-green-700 p-4 rounded-xl flex items-center gap-2">
          <CheckCircle size={20} />
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Clock className="text-blue-600" />
          Working Hours
        </h2>
        <form onSubmit={handleUpdateAvailability} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Working Days (1=Mon, 7=Sun)</label>
            <input type="text" value={formData.workingDays} onChange={e => setFormData({...formData, workingDays: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="e.g. 1,2,3,4,5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Slot Duration (Mins)</label>
            <input type="number" value={formData.slotDuration} onChange={e => setFormData({...formData, slotDuration: parseInt(e.target.value)})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
            <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
            <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
              Save Availability
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Calendar className="text-red-500" />
          Block Time Off
        </h2>
        <form onSubmit={handleBlockSlot} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input type="date" required value={blockedSlot.date} onChange={e => setBlockedSlot({...blockedSlot, date: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reason (Optional)</label>
            <input type="text" value={blockedSlot.reason} onChange={e => setBlockedSlot({...blockedSlot, reason: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg" placeholder="e.g. Lunch, Vacation" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
            <input type="time" required value={blockedSlot.startTime} onChange={e => setBlockedSlot({...blockedSlot, startTime: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
            <input type="time" required value={blockedSlot.endTime} onChange={e => setBlockedSlot({...blockedSlot, endTime: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600">
              Block Slot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
