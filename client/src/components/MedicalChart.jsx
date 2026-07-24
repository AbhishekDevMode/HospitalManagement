import { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Download, Activity, Calendar, Plus } from "lucide-react";
import jsPDF from "jspdf";

export default function MedicalChart({ user, targetPatientId }) {
  const [timeline, setTimeline] = useState({
    appointments: [],
    records: [],
    prescriptions: []
  });
  const [loading, setLoading] = useState(true);

  // Prescription Form
  const [showRxForm, setShowRxForm] = useState(false);
  const [rxAppointmentId, setRxAppointmentId] = useState("");
  const [rxMedicines, setRxMedicines] = useState("");
  const [rxInstructions, setRxInstructions] = useState("");

  useEffect(() => {
    fetchTimeline();
  }, [targetPatientId]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
      const url = `${API_BASE}/api/portal/timeline/patient/${targetPatientId}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTimeline(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
      await axios.post(`${API_BASE}/api/prescriptions`, {
        appointmentId: rxAppointmentId,
        medicines: rxMedicines,
        instructions: rxInstructions
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowRxForm(false);
      setRxAppointmentId("");
      setRxMedicines("");
      setRxInstructions("");
      fetchTimeline();
    } catch (err) {
      console.error(err);
      alert("Failed to create prescription");
    }
  };

  const downloadPrescription = (rx) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Medical Prescription", 20, 20);
    doc.setFontSize(12);
    doc.text(`Doctor: Dr. ${rx.doctor.name}`, 20, 30);
    doc.text(`Patient: ${rx.patient.name}`, 20, 40);
    doc.text(`Date: ${new Date(rx.prescribedAt).toLocaleDateString()}`, 20, 50);
    
    doc.setFontSize(14);
    doc.text("Medicines:", 20, 70);
    doc.setFontSize(12);
    doc.text(rx.medicines || "No medicines listed.", 20, 80, { maxWidth: 170 });
    
    doc.setFontSize(14);
    doc.text("Instructions:", 20, 120);
    doc.setFontSize(12);
    doc.text(rx.instructions || "No special instructions.", 20, 130, { maxWidth: 170 });
    
    doc.save(`Prescription_${rx.id}.pdf`);
  };

  if (loading) return <div className="text-slate-500">Loading chart...</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Patient EHR Timeline</h2>
        <button 
          onClick={() => setShowRxForm(!showRxForm)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus size={16} /> Write Prescription
        </button>
      </div>
      
      {showRxForm && (
        <form onSubmit={handleCreatePrescription} className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8">
          <h3 className="font-bold text-slate-800 mb-4">New Prescription</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Select Appointment</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                value={rxAppointmentId}
                onChange={e => setRxAppointmentId(e.target.value)}
                required
              >
                <option value="">-- Choose an appointment --</option>
                {timeline.appointments.map(apt => (
                  <option key={apt.id} value={apt.id}>
                    {new Date(apt.startTime).toLocaleString()} - {apt.status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Medicines</label>
              <textarea 
                className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                rows="3"
                value={rxMedicines}
                onChange={e => setRxMedicines(e.target.value)}
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Instructions</label>
              <textarea 
                className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                rows="2"
                value={rxInstructions}
                onChange={e => setRxInstructions(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowRxForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Save Prescription</button>
            </div>
          </div>
        </form>
      )}

      {/* Timeline */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent mt-8">
        
        {timeline.prescriptions.map((rx, idx) => (
          <div key={`rx-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <FileText size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800">Prescription</span>
                <span className="text-xs font-semibold text-slate-500">{new Date(rx.prescribedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{rx.medicines}</p>
              <button 
                onClick={() => downloadPrescription(rx)}
                className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        ))}

        {timeline.records.map((rec, idx) => (
          <div key={`rec-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-100 text-green-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Activity size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800">Uploaded Record</span>
                <span className="text-xs font-semibold text-slate-500">{new Date(rec.uploadedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-600 font-medium">{rec.description}</p>
              <p className="text-xs text-slate-400 mt-1">File: {rec.fileName}</p>
            </div>
          </div>
        ))}

        {timeline.appointments.map((apt, idx) => (
          <div key={`apt-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <Calendar size={18} />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800">Consultation</span>
                <span className="text-xs font-semibold text-slate-500">{new Date(apt.startTime).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-slate-600">Status: <span className="font-semibold">{apt.status}</span></p>
            </div>
          </div>
        ))}
        
      </div>
    </div>
  );
}
