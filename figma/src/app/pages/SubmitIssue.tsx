import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, Camera, Send } from "lucide-react";

type IssueType = "weeds" | "litter" | "graffiti" | "pothole" | "streetlight" | "other";

export default function SubmitIssue() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: "" as IssueType | "",
    location: "",
    description: "",
    priority: "medium",
    submittedBy: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to backend
    alert("Issue submitted successfully!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5DADE2] to-[#3498DB]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white hover:text-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="text-white">
            <span className="text-gray-900">ONE</span>
            <span className="text-[#D4183D] ml-1">ALBUQUERQUE</span>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-6">
              <h1 className="text-3xl mb-2">
                <span className="text-gray-900">REPORT AN </span>
                <span className="text-[#D4183D]">ISSUE</span>
              </h1>
              <p className="text-gray-600">
                Fill out the details below to submit a new issue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Type */}
              <div>
                <label className="block mb-2 text-gray-700">Issue Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as IssueType })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5DADE2]"
                >
                  <option value="">Select issue type...</option>
                  <option value="weeds">Weeds</option>
                  <option value="litter">Litter</option>
                  <option value="graffiti">Graffiti</option>
                  <option value="pothole">Pothole</option>
                  <option value="streetlight">Street Light</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block mb-2 text-gray-700">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    required
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., 1234 Main St NW, or nearest intersection"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5DADE2]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block mb-2 text-gray-700">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about the issue..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5DADE2]"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block mb-2 text-gray-700">Priority *</label>
                <div className="grid grid-cols-3 gap-3">
                  {["low", "medium", "high"].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority })}
                      className={`py-3 px-4 rounded-lg border-2 transition capitalize ${
                        formData.priority === priority
                          ? priority === "high"
                            ? "border-[#D4183D] bg-[#D4183D] text-white"
                            : priority === "medium"
                            ? "border-[#F39C12] bg-[#F39C12] text-white"
                            : "border-[#27AE60] bg-[#27AE60] text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submitted By */}
              <div>
                <label className="block mb-2 text-gray-700">Your Name *</label>
                <input
                  required
                  type="text"
                  value={formData.submittedBy}
                  onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5DADE2]"
                />
              </div>

              {/* Photo Upload Placeholder */}
              <div>
                <label className="block mb-2 text-gray-700">Photo (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#5DADE2] transition cursor-pointer">
                  <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Click to upload a photo</p>
                  <p className="text-sm text-gray-400 mt-1">JPG, PNG up to 10MB</p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#5DADE2] to-[#3498DB] hover:from-[#4A9FD3] hover:to-[#2E86C2] text-white py-4 rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Submit Issue
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
