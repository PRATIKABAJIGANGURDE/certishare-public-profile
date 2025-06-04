
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Eye, Calendar, Building, Award, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

const PublicProfile = () => {
  const { username } = useParams();
  const [copiedLink, setCopiedLink] = useState("");

  // Fetch user profile by username
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['publicProfile', username],
    queryFn: async () => {
      if (!username) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!username
  });

  // Fetch user's public certificates
  const { data: certificates = [] } = useQuery({
    queryKey: ['publicCertificates', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!profile?.id
  });

  const profileUrl = `${window.location.origin}/u/${username}`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(""), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const totalViews = certificates.reduce((sum, cert) => sum + cert.views, 0);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">This profile doesn't exist or has been set to private.</p>
            <Link to="/">
              <Button>Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <Award className="w-6 h-6" />
              <span className="text-lg font-bold">CertShare</span>
            </Link>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(profileUrl, "profile")}
              className="flex items-center space-x-2"
            >
              {copiedLink === "profile" ? (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Profile</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  getInitials(profile.display_name)
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{profile.display_name}</h1>
                  <Badge variant="secondary">@{profile.username}</Badge>
                </div>
                <p className="text-gray-600 mb-4 max-w-2xl">{profile.bio || "No bio added yet."}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(profile.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Building className="w-4 h-4" />
                    <span>{certificates.length} Certificates</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{totalViews.toLocaleString()} Total Views</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action for Visitors */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Want to create your own certificate portfolio?
              </h2>
              <p className="text-gray-600 mb-4">
                Join CertShare and start sharing your professional achievements with the world
              </p>
              <Link to="/login">
                <Button>
                  <Award className="w-4 h-4 mr-2" />
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Certificates Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Public Certificates</h2>
            <div className="text-sm text-gray-500">
              {certificates.length} public certificate{certificates.length !== 1 ? 's' : ''}
            </div>
          </div>

          {certificates.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No public certificates</h3>
                <p className="text-gray-600">This user hasn't shared any public certificates yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <Link to={`/c/${cert.id}`}>
                    <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden flex items-center justify-center">
                      <Award className="w-16 h-16 text-gray-400" />
                    </div>
                  </Link>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg leading-tight">
                      <Link to={`/c/${cert.id}`} className="hover:text-blue-600 transition-colors">
                        {cert.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2 text-sm">
                      <Building className="w-4 h-4" />
                      <span>{cert.issuer}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{cert.description || "No description provided."}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{formatDate(cert.issue_date)}</span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{cert.views}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            copyToClipboard(`${window.location.origin}/c/${cert.id}`, cert.id);
                          }}
                          className="h-8 px-2"
                        >
                          {copiedLink === cert.id ? (
                            <span className="text-green-600">Copied!</span>
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Powered by CertShare */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            Powered by{" "}
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
              CertShare
            </Link>
            {" "}• The professional way to share certificates
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
