import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Star, MessageSquare } from "lucide-react";

export default function DoctorSearch({ user }) {
  const [doctors, setDoctors] = useState([]);
  const [specialization, setSpecialization] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [reviewDoctor, setReviewDoctor] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, [specialization, minRating]);

  const fetchDoctors = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
      const params = new URLSearchParams();
      if (specialization) params.append("specialization", specialization);
      if (minRating > 0) params.append("minRating", minRating);
      
      const res = await axios.get(`${API_BASE}/api/doctors/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const submitReview = async () => {
    if (!reviewDoctor) return;
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
      await axios.post(`${API_BASE}/api/doctors/${reviewDoctor.id}/reviews`, 
        { rating, comment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReviewDoctor(null);
      setComment("");
      setRating(5);
      fetchDoctors(); // Refresh ratings
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Find a Doctor</h2>
      
      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by specialization (e.g. Cardiologist)"
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={specialization}
            onChange={e => setSpecialization(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={minRating}
          onChange={e => setMinRating(Number(e.target.value))}
        >
          <option value="0">Any Rating</option>
          <option value="3">3+ Stars</option>
          <option value="4">4+ Stars</option>
          <option value="5">5 Stars</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map(doc => (
          <div key={doc.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
            <h3 className="font-bold text-lg text-slate-800">Dr. {doc.name}</h3>
            <p className="text-blue-600 font-medium text-sm mb-2">{doc.specialization}</p>
            <div className="flex items-center gap-1 mb-3">
              <Star className="text-yellow-400 fill-current" size={16} />
              <span className="font-semibold text-slate-700">{doc.rating.toFixed(1)}</span>
              <span className="text-slate-400 text-xs">({doc.reviewCount} reviews)</span>
            </div>
            <p className="text-slate-600 text-sm mb-4 line-clamp-2">{doc.bio || "No bio available."}</p>
            
            <button 
              onClick={() => setReviewDoctor(doc)}
              className="w-full py-2 bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors border border-slate-200">
              Leave a Review
            </button>
          </div>
        ))}
      </div>

      {reviewDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Review Dr. {reviewDoctor.name}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rating (1-5)</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(star => (
                  <button 
                    key={star}
                    onClick={() => setRating(star)}
                    className={`${rating >= star ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}
                  >
                    <Star size={24} className={rating >= star ? "fill-current" : ""} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Comment</label>
              <textarea 
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setReviewDoctor(null)}
                className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-50 rounded-lg">
                Cancel
              </button>
              <button 
                onClick={submitReview}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
