import { useNavigate } from "react-router";
import { AlertCircle, Shield } from "lucide-react";
import cabqLogo from "../../imports/SEE_THAT_P._Montoya.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#5DADE2] to-[#3498DB]">
      <div className="container mx-auto px-4 py-8">
        {/* Header with branding */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              <span className="text-gray-900">ONE</span>
              <span className="block">
                <span className="text-[#D4183D]">ALBU</span>
                <span className="text-gray-900">QU</span>
                <span className="text-[#D4183D]">E</span>
              </span>
            </div>
          </div>
          <div className="text-white text-sm">
            City of Albuquerque
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <img 
                  src={cabqLogo} 
                  alt="See That? Text Pat" 
                  className="w-full max-w-2xl mx-auto mb-6"
                />
                <h1 className="text-4xl mb-4">
                  <span className="text-gray-900">SEE </span>
                  <span className="text-[#D4183D]">THAT?</span>
                </h1>
                <p className="text-xl text-gray-600 mb-2">
                  City Employee Issue Reporting System
                </p>
                <p className="text-gray-500">
                  Help keep Albuquerque clean and safe by reporting issues you observe
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-12">
                {/* Submit Issue Card */}
                <button
                  onClick={() => navigate('/submit')}
                  className="bg-gradient-to-br from-[#5DADE2] to-[#3498DB] hover:from-[#4A9FD3] hover:to-[#2E86C2] text-white p-8 rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-2xl mb-2">Report an Issue</h2>
                  <p className="text-blue-100">
                    Submit a new issue that needs attention
                  </p>
                </button>

                {/* Admin Area Card */}
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-gradient-to-br from-[#D4183D] to-[#B01530] hover:from-[#C01538] hover:to-[#A01229] text-white p-8 rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  <Shield className="w-16 h-16 mx-auto mb-4" />
                  <h2 className="text-2xl mb-2">Admin Area</h2>
                  <p className="text-red-100">
                    Triage and assign reported issues
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-white text-sm">
            <p>© 2026 City of Albuquerque • cabq.gov</p>
          </div>
        </div>
      </div>
    </div>
  );
}
