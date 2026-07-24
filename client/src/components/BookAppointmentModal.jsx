import { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";

export default function BookAppointmentModal({ isOpen, onClose, onBooked }) {
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    time: ""
  });
  const [error, setError] = useState("");
  const [isPaymentStep, setIsPaymentStep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const user = JSON.parse(localStorage.getItem("user"));
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
      axios.get(`${API_BASE}/api/doctors`, {
        headers: { Authorization: `Bearer ${user.token}` }
      }).then(res => setDoctors(res.data))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.doctorId && formData.date) {
      fetchSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [formData.doctorId, formData.date]);

  const fetchSlots = async () => {
    setIsLoadingSlots(true);
    setAvailableSlots([]);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
      const res = await axios.get(`${API_BASE}/api/doctors/${formData.doctorId}/slots?date=${formData.date}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAvailableSlots(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch available slots");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsProcessing(true);
    
    const user = JSON.parse(localStorage.getItem("user"));

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Combine date and time
    const startDateTime = new Date(`${formData.date}T${formData.time}:00`);
    
    // Find the doctor's slotDuration
    const selectedDoctor = doctors.find(d => d.id.toString() === formData.doctorId.toString());
    const duration = selectedDoctor?.slotDuration || 30;

    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
      await axios.post(`${API_BASE}/api/appointments`, {
        doctorId: formData.doctorId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setIsPaymentStep(false);
      onBooked();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setIsProcessing(false);
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

        {!isPaymentStep ? (
          <form onSubmit={(e) => { e.preventDefault(); setIsPaymentStep(true); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Doctor</label>
              <select required value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value, time: ""})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                <option value="">-- Choose a Doctor --</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialization}) - $50</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input type="date" required min={new Date().toISOString().split("T")[0]} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value, time: ""})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"/>
            </div>
            
            {formData.doctorId && formData.date && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Available Slots</label>
                {isLoadingSlots ? (
                  <p className="text-sm text-slate-500">Loading slots...</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-red-500">No slots available for this date.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                    {availableSlots.map(slot => (
                      <button 
                        key={slot} 
                        type="button"
                        onClick={() => setFormData({...formData, time: slot})}
                        className={`py-2 text-sm rounded-lg border font-medium transition-colors ${formData.time === slot ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50'}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <button type="submit" disabled={!formData.time} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mt-4">
              Proceed to Payment
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-slate-500 mb-2">Total Consultation Fee</p>
              <h3 className="text-3xl font-bold text-slate-800">$50.00</h3>
            </div>
            
            <button 
              onClick={handleSubmit} 
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {isProcessing ? "Processing Payment..." : "Pay securely with Card (Mock)"}
            </button>
            <button 
              onClick={() => setIsPaymentStep(false)}
              className="w-full text-slate-500 font-semibold py-2 hover:text-slate-700">
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
