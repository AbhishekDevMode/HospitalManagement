import { useEffect, useState } from "react";
import axios from "axios";
import { FileText, Upload, Download, Activity, Calendar } from "lucide-react";
import jsPDF from "jspdf";

export default function PatientEHR({ user }) {
  const [timeline, setTimeline] = useState({
    appointments: [],
    records: [],
    prescriptions: []
  });
  
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
      const res = await axios.get(`${API_BASE}/api/portal/timeline`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTimeline(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    setUploading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
      await axios.post(`${API_BASE}/api/portal/records/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setFile(null);
      setDescription("");
      fetchTimeline();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Electronic Health Records</h2>
        
        {/* Upload Form */}
        <form onSubmit={handleUpload} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Past Report/Scan</label>
            <input 
              type="file" 
              onChange={e => setFile(e.target.files[0])}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <input 
              type="text" 
              placeholder="e.g. Blood Test Results 2025"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            <Upload size={18} /> {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {/* Timeline */}
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          
          {timeline.prescriptions.map((rx, idx) => (
            <div key={`rx-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <FileText size={18} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">Prescription from Dr. {rx.doctor.name}</span>
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
                  <span className="font-bold text-slate-800">Consultation with Dr. {apt.doctor.name}</span>
                  <span className="text-xs font-semibold text-slate-500">{new Date(apt.startTime).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-600">Status: <span className="font-semibold">{apt.status}</span></p>
              </div>
            </div>
          ))}
          
        </div>
      </div>
    </div>
  );
}
