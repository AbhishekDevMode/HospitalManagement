import { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

export default function BookAppointmentModal({ isOpen, onClose, onBooked }) {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    time: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const user = JSON.parse(localStorage.getItem("user"));
      axios.get("http://localhost:8081/api/doctors", {
        headers: { Authorization: `Bearer ${user.token}` }
      }).then(res => setDoctors(res.data))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const user = JSON.parse(localStorage.getItem("user"));

    // Combine date and time
    const startDateTime = new Date(`${formData.date}T${formData.time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // 30 min duration

    try {
      await axios.post("http://localhost:8081/api/appointments", {
        doctorId: formData.doctorId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      onBooked();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Book Appointment</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
        </div>

        {error && <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Doctor</label>
            <select required value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg">
              <option value="">-- Choose a Doctor --</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialization})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
              <input type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"/>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700">
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}
