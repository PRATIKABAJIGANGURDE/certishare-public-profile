
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Eye, Calendar, Building, Award, Copy, ArrowLeft } from "lucide-react";
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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary"></div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center border-border/50 shadow-xl">
          <CardContent className="pt-6">
            <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground mb-6">This profile doesn't exist or has been set to private.</p>
            <Link to="/login">
              <Button className="bg-primary hover:bg-primary/90">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header with Glass Effect */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/login" className="flex items-center space-x-3 text-primary hover:text-primary/80 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                CertShare
              </span>
            </Link>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(profileUrl, "profile")}
              className="flex items-center space-x-2 bg-card/50 border-border/50 hover:bg-card transition-all duration-200"
            >
              {copiedLink === "profile" ? (
                <>
                  <Copy className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">Copied!</span>
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
        {/* Premium Profile Header */}
        <Card className="mb-8 border-border/50 shadow-2xl bg-gradient-to-br from-card to-card/50">
          <CardContent className="pt-8">
            <div className="flex items-start space-x-8">
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      className="w-28 h-28 rounded-2xl object-cover"
                    />
                  ) : (
                    getInitials(profile.display_name)
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <h1 className="text-4xl font-bold text-foreground">{profile.display_name}</h1>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    @{profile.username}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-6 max-w-2xl text-lg leading-relaxed">
                  {profile.bio || "Welcome to my certificate portfolio! Explore my professional achievements and certifications."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Joined</p>
                      <p className="font-semibold text-foreground">{formatDate(profile.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Certificates</p>
                      <p className="font-semibold text-foreground">{certificates.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Views</p>
                      <p className="font-semibold text-foreground">{totalViews.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Call to Action */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border-primary/20 shadow-xl">
          <CardContent className="pt-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Award className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Ready to showcase your achievements?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your professional certificate portfolio and share your expertise with the world
              </p>
              <Link to="/login">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg">
                  <Award className="w-5 h-5 mr-2" />
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Premium Certificates Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Certificate Portfolio</h2>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {certificates.length} Public Certificate{certificates.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {certificates.length === 0 ? (
            <Card className="text-center py-16 border-border/50 shadow-xl">
              <CardContent>
                <div className="w-20 h-20 bg-gradient-to-br from-muted/20 to-muted/40 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <Award className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">No public certificates yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  This professional hasn't shared any public certificates yet. Check back later to see their achievements!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {certificates.map((cert, index) => (
                <Card key={cert.id} className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/20 bg-gradient-to-br from-card to-card/50 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <Link to={`/c/${cert.id}`}>
                    <div className="aspect-video bg-gradient-to-br from-primary/5 to-accent/5 rounded-t-lg overflow-hidden flex items-center justify-center relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/40 rounded-xl flex items-center justify-center">
                        <Award className="w-10 h-10 text-primary" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-card/80 backdrop-blur-sm">
                          {cert.file_type === 'application/pdf' ? 'PDF' : 'Image'}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                      <Link to={`/c/${cert.id}`}>
                        {cert.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>{cert.issuer}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {cert.description || "Professional certification demonstrating expertise and achievement in this field."}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{formatDate(cert.issue_date)}</span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
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
                          className="h-8 px-2 hover:bg-primary/10"
                        >
                          {copiedLink === cert.id ? (
                            <span className="text-green-500 text-xs">Copied!</span>
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

        {/* Premium Footer */}
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2 text-muted-foreground">
            <span className="text-sm">Powered by</span>
            <Link to="/login" className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
              <div className="w-5 h-5 bg-gradient-to-br from-primary to-primary/70 rounded flex items-center justify-center">
                <Award className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="font-semibold">CertShare</span>
            </Link>
            <span className="text-sm">• The premium way to share certificates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
