
import { useState } from "react";
import { Award, Calendar, Building, Eye, Share2, Settings } from "lucide-react";
import Navigation from "../components/Navigation";
import { Link } from "react-router-dom";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("certificates");

  // Mock user data
  const user = {
    name: "John Doe",
    username: "johndoe",
    email: "john.doe@example.com",
    avatar: "JD",
    bio: "Full-stack developer passionate about cloud technologies and continuous learning.",
    joinDate: "January 2024",
    totalViews: 1547,
    totalCertificates: 8
  };

  // Mock certificates data
  const certificates = [
    {
      id: "cert1",
      title: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2024-01-15",
      views: 245,
      type: "pdf",
      isPublic: true
    },
    {
      id: "cert2",
      title: "React Developer Certification",
      issuer: "Meta",
      date: "2024-02-10",
      views: 189,
      type: "image",
      isPublic: true
    },
    {
      id: "cert3",
      title: "Docker Certified Associate",
      issuer: "Docker Inc.",
      date: "2024-03-05",
      views: 156,
      type: "pdf",
      isPublic: false
    }
  ];

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/u/${user.username}`);
    // In real app, show toast notification
    alert("Profile link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.avatar}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
                <p className="text-blue-400 mb-2">@{user.username}</p>
                <p className="text-gray-400 max-w-md">{user.bio}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={copyProfileLink}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Profile</span>
              </button>
              <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{user.totalCertificates}</div>
              <div className="text-gray-400">Certificates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{user.totalViews.toLocaleString()}</div>
              <div className="text-gray-400">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{user.joinDate}</div>
              <div className="text-gray-400">Member Since</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setActiveTab("certificates")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "certificates"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Certificates
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "settings"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "certificates" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <Award className="w-8 h-8 text-blue-400" />
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${cert.isPublic ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                    <span className="text-xs text-gray-400">
                      {cert.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-white mb-3">{cert.title}</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Building className="w-4 h-4 mr-2" />
                    {cert.issuer}
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(cert.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Eye className="w-4 h-4 mr-2" />
                    {cert.views} views
                  </div>
                </div>

                <Link
                  to={`/c/${cert.id}`}
                  className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  View Certificate
                </Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  defaultValue={user.bio}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={user.email}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
