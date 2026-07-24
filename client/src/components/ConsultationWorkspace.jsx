import { useState } from "react";
import axios from "axios";
import { FileText, Save, Plus, Trash2, X } from "lucide-react";

export default function ConsultationWorkspace({ appointment, onClose }) {
  const [activeTab, setActiveTab] = useState("prescription");
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", duration: "", notes: "" }]);
  const [prescriptionInstructions, setPrescriptionInstructions] = useState("");
  
  const [notes, setNotes] = useState({
    privateNotes: appointment.privateNotes || "",
    sharedNotes: appointment.sharedNotes || "",
    labTests: appointment.labTests || ""
  });
  
  const [message, setMessage] = useState("");
  
  const user = JSON.parse(localStorage.getItem("user"));
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: "", dosage: "", duration: "", notes: "" }]);
  };

  const handleRemoveMedicine = (index) => {
    const newMeds = medicines.filter((_, i) => i !== index);
    setMedicines(newMeds);
  };

  const handleMedicineChange = (index, field, value) => {
    const newMeds = [...medicines];
    newMeds[index][field] = value;
    setMedicines(newMeds);
  };

  const handleSavePrescription = async () => {
    try {
      await axios.post(`${API_BASE}/api/prescriptions`, {
        appointmentId: appointment.id,
        medicines: JSON.stringify(medicines),
        instructions: prescriptionInstructions
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessage("Prescription saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await axios.put(`${API_BASE}/api/appointments/${appointment.id}/notes`, notes, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessage("Consultation notes saved!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold">Consultation Workspace</h2>
            <p className="text-slate-300 text-sm">Patient: {appointment.patient.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors"><X size={28}/></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
          <button 
            onClick={() => setActiveTab("prescription")}
            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'prescription' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Digital Prescription
          </button>
          <button 
            onClick={() => setActiveTab("notes")}
            className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === 'notes' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Consultation Notes & Labs
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {message && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle size={20}/> {message}
            </div>
          )}

          {activeTab === "prescription" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="text-blue-600"/> Structured Prescription
                </h3>
                <button onClick={handleAddMedicine} className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 font-semibold transition-colors">
                  <Plus size={16}/> Add Medicine
                </button>
              </div>
              
              <div className="space-y-4">
                {medicines.map((med, index) => (
                  <div key={index} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm relative group">
                    <button onClick={() => handleRemoveMedicine(index)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={20}/>
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-8">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Medicine Name</label>
                        <input type="text" placeholder="e.g. Paracetamol 500mg" value={med.name} onChange={e => handleMedicineChange(index, "name", e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"/>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Dosage</label>
                        <input type="text" placeholder="e.g. 1-0-1 (After Food)" value={med.dosage} onChange={e => handleMedicineChange(index, "dosage", e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"/>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Duration</label>
                        <input type="text" placeholder="e.g. 5 days" value={med.duration} onChange={e => handleMedicineChange(index, "duration", e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"/>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notes</label>
                        <input type="text" placeholder="e.g. Take with warm water" value={med.notes} onChange={e => handleMedicineChange(index, "notes", e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"/>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="block text-sm font-semibold text-slate-700 mb-2">General Instructions</label>
                <textarea 
                  value={prescriptionInstructions} 
                  onChange={e => setPrescriptionInstructions(e.target.value)} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  placeholder="Rest, drink plenty of fluids..."
                ></textarea>
              </div>

              <div className="flex justify-end mt-4">
                <button onClick={handleSavePrescription} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                  <Save size={20}/> Save Prescription
                </button>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Private Notes */}
                <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-200 shadow-sm">
                  <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Private Notes
                  </h3>
                  <p className="text-xs text-yellow-700 mb-3 font-medium">Visible only to you.</p>
                  <textarea 
                    value={notes.privateNotes} 
                    onChange={e => setNotes({...notes, privateNotes: e.target.value})} 
                    className="w-full p-3 rounded-xl border border-yellow-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-yellow-400 outline-none transition-all min-h-[150px] resize-none text-sm"
                    placeholder="E.g., Patient seems anxious about the symptoms. Follow up strictly next week."
                  ></textarea>
                </div>

                {/* Shared Notes */}
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 shadow-sm">
                  <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Shared Notes
                  </h3>
                  <p className="text-xs text-blue-700 mb-3 font-medium">Patient will see this in their Portal.</p>
                  <textarea 
                    value={notes.sharedNotes} 
                    onChange={e => setNotes({...notes, sharedNotes: e.target.value})} 
                    className="w-full p-3 rounded-xl border border-blue-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all min-h-[150px] resize-none text-sm"
                    placeholder="E.g., Discussed lifestyle changes. Recommended dietary adjustments."
                  ></textarea>
                </div>

              </div>

              {/* Lab Tests */}
              <div className="bg-purple-50 p-5 rounded-2xl border border-purple-200 shadow-sm mt-6">
                <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Lab Test Recommendations
                </h3>
                <p className="text-xs text-purple-700 mb-3 font-medium">Specify tests the patient needs to undergo.</p>
                <textarea 
                  value={notes.labTests} 
                  onChange={e => setNotes({...notes, labTests: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-purple-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-purple-400 outline-none transition-all min-h-[100px] resize-none text-sm"
                  placeholder="E.g., Complete Blood Count (CBC), Fasting Blood Sugar, Lipid Profile"
                ></textarea>
              </div>

              <div className="flex justify-end mt-4">
                <button onClick={handleSaveNotes} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm">
                  <Save size={20}/> Save Notes & Tests
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
