
import { useState } from "react";
import { Search, Eye, Award, Calendar, Building, User } from "lucide-react";
import Navigation from "../components/Navigation";
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CertificateWithProfile {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  views: number;
  file_type: string;
  description: string | null;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['public-certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          profiles!inner (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CertificateWithProfile[];
    }
  });

  const filteredCertificates = certificates.filter(cert =>
    cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.profiles.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.profiles.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Explore Certificates</h1>
          <p className="text-gray-400">Discover amazing achievements from our community</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search certificates, issuers, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Certificates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((cert) => (
            <div key={cert.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {cert.profiles.avatar_url ? (
                      <img src={cert.profiles.avatar_url} alt={cert.profiles.display_name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      getInitials(cert.profiles.display_name)
                    )}
                  </div>
                  <div>
                    <Link to={`/u/${cert.profiles.username}`} className="text-white hover:text-blue-400 font-medium">
                      {cert.profiles.display_name}
                    </Link>
                    <div className="flex items-center text-gray-400 text-sm mt-1">
                      <Eye className="w-3 h-3 mr-1" />
                      {cert.views} views
                    </div>
                  </div>
                </div>
                <Award className="w-6 h-6 text-blue-400" />
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {cert.title}
              </h3>

              {cert.description && (
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{cert.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-400 text-sm">
                  <Building className="w-4 h-4 mr-2" />
                  {cert.issuer}
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(cert.issue_date).toLocaleDateString()}
                </div>
              </div>

              <Link
                to={`/c/${cert.id}`}
                className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Certificate
              </Link>
            </div>
          ))}
        </div>

        {filteredCertificates.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No certificates found</h3>
            <p className="text-gray-400">Try adjusting your search query or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
