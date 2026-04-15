import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Search, Filter, CheckCircle2, XCircle, Clock, UserPlus } from "lucide-react";

interface Issue {
  id: string;
  type: string;
  location: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "new" | "assigned" | "in-progress" | "resolved";
  submittedBy: string;
  assignedTo?: string;
  dateSubmitted: string;
}

// Mock data
const mockIssues: Issue[] = [
  {
    id: "ISS-001",
    type: "Weeds",
    location: "1234 Central Ave NW",
    description: "Overgrown weeds in median strip, approximately 20 feet long",
    priority: "medium",
    status: "new",
    submittedBy: "John Smith",
    dateSubmitted: "2026-04-14",
  },
  {
    id: "ISS-002",
    type: "Litter",
    location: "5th St & Lomas Blvd",
    description: "Large amount of trash and debris near bus stop",
    priority: "high",
    status: "new",
    submittedBy: "Maria Garcia",
    dateSubmitted: "2026-04-14",
  },
  {
    id: "ISS-003",
    type: "Graffiti",
    location: "Rio Grande Blvd underpass",
    description: "Graffiti on concrete walls, approximately 10 sq ft",
    priority: "medium",
    status: "assigned",
    submittedBy: "David Lee",
    assignedTo: "Team B",
    dateSubmitted: "2026-04-13",
  },
  {
    id: "ISS-004",
    type: "Pothole",
    location: "Coors Blvd & Montano",
    description: "Large pothole in right lane, safety hazard",
    priority: "high",
    status: "in-progress",
    submittedBy: "Sarah Johnson",
    assignedTo: "Team A",
    dateSubmitted: "2026-04-12",
  },
];

export default function Admin() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const filteredIssues = issues.filter((issue) => {
    const matchesStatus = filterStatus === "all" || issue.status === filterStatus;
    const matchesSearch = 
      issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const assignIssue = (issueId: string, assignee: string) => {
    setIssues(issues.map(issue => 
      issue.id === issueId 
        ? { ...issue, assignedTo: assignee, status: "assigned" as const }
        : issue
    ));
    setSelectedIssue(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-[#D4183D] bg-red-50";
      case "medium": return "text-[#F39C12] bg-orange-50";
      case "low": return "text-[#27AE60] bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new": return <Clock className="w-4 h-4" />;
      case "assigned": return <UserPlus className="w-4 h-4" />;
      case "in-progress": return <Clock className="w-4 h-4" />;
      case "resolved": return <CheckCircle2 className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#D4183D] to-[#B01530] text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:text-gray-100 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            <div className="text-lg">
              <span className="text-white">ONE</span>
              <span className="text-gray-900 ml-1">ALBUQUERQUE</span>
            </div>
          </div>
          <h1 className="text-3xl mt-4">Admin Dashboard</h1>
          <p className="text-red-100 mt-1">Triage and assign reported issues</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl text-gray-900">{issues.filter(i => i.status === "new").length}</div>
            <div className="text-gray-600">New Issues</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl text-gray-900">{issues.filter(i => i.status === "assigned").length}</div>
            <div className="text-gray-600">Assigned</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl text-gray-900">{issues.filter(i => i.status === "in-progress").length}</div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl text-gray-900">{issues.filter(i => i.status === "resolved").length}</div>
            <div className="text-gray-600">Resolved</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, type, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4183D]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4183D]"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">Location</th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">Priority</th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">Submitted By</th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{issue.id}</td>
                    <td className="px-6 py-4">{issue.type}</td>
                    <td className="px-6 py-4 text-gray-600">{issue.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(issue.status)}
                        <span className="capitalize text-sm">{issue.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{issue.submittedBy}</td>
                    <td className="px-6 py-4 text-gray-600">{issue.dateSubmitted}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedIssue(issue)}
                        className="text-[#D4183D] hover:text-[#B01530] transition"
                      >
                        View/Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl">Issue Details</h2>
                <p className="text-gray-600 mt-1">{selectedIssue.id}</p>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2">{selectedIssue.type}</span>
              </div>
              <div>
                <span className="text-gray-600">Location:</span>
                <span className="ml-2">{selectedIssue.location}</span>
              </div>
              <div>
                <span className="text-gray-600">Description:</span>
                <p className="mt-1 text-gray-900">{selectedIssue.description}</p>
              </div>
              <div>
                <span className="text-gray-600">Priority:</span>
                <span className={`ml-2 px-3 py-1 rounded-full text-sm ${getPriorityColor(selectedIssue.priority)}`}>
                  {selectedIssue.priority}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Submitted By:</span>
                <span className="ml-2">{selectedIssue.submittedBy}</span>
              </div>
              {selectedIssue.assignedTo && (
                <div>
                  <span className="text-gray-600">Assigned To:</span>
                  <span className="ml-2">{selectedIssue.assignedTo}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <label className="block mb-2 text-gray-700">Assign to Team</label>
              <select
                onChange={(e) => assignIssue(selectedIssue.id, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4183D] mb-4"
                defaultValue=""
              >
                <option value="" disabled>Select a team...</option>
                <option value="Team A - Streets & Roads">Team A - Streets & Roads</option>
                <option value="Team B - Parks & Recreation">Team B - Parks & Recreation</option>
                <option value="Team C - Sanitation">Team C - Sanitation</option>
                <option value="Team D - Graffiti Removal">Team D - Graffiti Removal</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
