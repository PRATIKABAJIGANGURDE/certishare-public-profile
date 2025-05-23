
import { useState, useEffect } from "react";
import { Award, Calendar, Building, Eye, Share2, Settings, User } from "lucide-react";
import Navigation from "../components/Navigation";
import { Link } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  views: number;
  file_type: string;
  is_public: boolean;
  description: string | null;
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState("certificates");
  const [editingProfile, setEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user
  });

  // Fetch user certificates
  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!user
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { display_name: string; bio: string }) => {
      if (!user) throw new Error('No user');
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setEditingProfile(false);
    }
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio || "");
    }
  }, [profile]);

  const copyProfileLink = () => {
    if (profile) {
      navigator.clipboard.writeText(`${window.location.origin}/u/${profile.username}`);
      alert("Profile link copied to clipboard!");
    }
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      display_name: displayName,
      bio: bio
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.display_name} className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  getInitials(profile.display_name)
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{profile.display_name}</h1>
                <p className="text-blue-400 mb-2">@{profile.username}</p>
                <p className="text-gray-400 max-w-md">{profile.bio || "No bio added yet."}</p>
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
              <button 
                onClick={() => setEditingProfile(true)}
                className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{certificates.length}</div>
              <div className="text-gray-400">Certificates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{certificates.reduce((sum, cert) => sum + cert.views, 0).toLocaleString()}</div>
              <div className="text-gray-400">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{new Date(profile.created_at).toLocaleDateString()}</div>
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
            {certificates.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No certificates yet</h3>
                <p className="text-gray-400 mb-4">Upload your first certificate to get started</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Upload Certificate
                </Link>
              </div>
            ) : (
              certificates.map((cert) => (
                <div key={cert.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <Award className="w-8 h-8 text-blue-400" />
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${cert.is_public ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <span className="text-xs text-gray-400">
                        {cert.is_public ? 'Public' : 'Private'}
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
                      {new Date(cert.issue_date).toLocaleDateString()}
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
              ))
            )}
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
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={profile.username}
                  disabled
                  className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>
              <button 
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2 px-6 rounded-lg transition-colors"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
