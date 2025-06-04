import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Download, Eye, Calendar, Building, Copy, ArrowLeft, FileText, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PDFViewer from "@/components/PDFViewer";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  description: string | null;
  file_url: string;
  file_type: string;
  views: number;
  is_public: boolean;
  user_id: string;
}

interface Profile {
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface CertificateWithProfile extends Certificate {
  profiles: Profile | null;
}

const CertificateView = () => {
  const { certId } = useParams();
  const [certificate, setCertificate] = useState<CertificateWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const { toast } = useToast();

  const certificateUrl = `${window.location.origin}/c/${certId}`;

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!certId) {
        setError("Certificate ID not provided");
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching certificate:', certId);
        
        // Fetch certificate data
        const { data: certData, error: certError } = await supabase
          .from('certificates')
          .select('*')
          .eq('id', certId)
          .eq('is_public', true)
          .single();

        if (certError) {
          console.error('Certificate fetch error:', certError);
          if (certError.code === 'PGRST116') {
            setError("Certificate not found or not public");
          } else {
            setError("Failed to load certificate");
          }
          setLoading(false);
          return;
        }

        console.log('Certificate data:', certData);

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, display_name, avatar_url')
          .eq('id', certData.user_id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          // Continue without profile data
        }

        console.log('Profile data:', profileData);

        // Combine certificate with profile
        const certificateWithProfile: CertificateWithProfile = {
          ...certData,
          profiles: profileData || null
        };

        setCertificate(certificateWithProfile);

        // Increment view count
        const { error: updateError } = await supabase
          .from('certificates')
          .update({ views: certData.views + 1 })
          .eq('id', certId);

        if (updateError) {
          console.error('Failed to update view count:', updateError);
        }

      } catch (err) {
        console.error('Unexpected error:', err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(certificateUrl);
    setCopiedLink(true);
    toast({
      title: "Link Copied!",
      description: "Certificate link has been copied to clipboard.",
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const downloadCertificate = () => {
    if (certificate?.file_url) {
      window.open(certificate.file_url, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-400" />;
    }
    return <ImageIcon className="w-6 h-6 text-blue-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
          <p className="text-gray-600 mb-4">{error || "The certificate you're looking for doesn't exist or is not public."}</p>
          <Link to="/explore" className="text-blue-600 hover:text-blue-700">
            ← Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {certificate.profiles ? (
              <Link 
                to={`/u/${certificate.profiles.username}`} 
                className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {certificate.profiles.display_name}'s Profile
              </Link>
            ) : (
              <Link to="/explore" className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Explore
              </Link>
            )}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="flex items-center space-x-2 border-gray-600 text-white hover:bg-gray-700"
              >
                {copiedLink ? (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={downloadCertificate} className="border-gray-600 text-white hover:bg-gray-700">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Certificate Header */}
        <Card className="mb-8 bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getFileIcon(certificate.file_type)}
                  <CardTitle className="text-2xl text-white">{certificate.title}</CardTitle>
                </div>
                <CardDescription className="flex items-center space-x-4 mb-4 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>{certificate.issuer}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Issued {formatDate(certificate.issue_date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{certificate.views.toLocaleString()} views</span>
                  </div>
                </CardDescription>
                {certificate.description && (
                  <p className="text-gray-300 mb-4">{certificate.description}</p>
                )}
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  {certificate.file_type === 'application/pdf' ? 'PDF Document' : 'Image File'}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Certificate Preview */}
        <Card className="mb-8 bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Certificate Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {certificate.file_type === 'application/pdf' ? (
              <PDFViewer 
                fileUrl={certificate.file_url} 
                fileName={certificate.title}
                className="w-full"
              />
            ) : (
              <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                <img
                  src={certificate.file_url}
                  alt={certificate.title}
                  className="max-w-full h-auto mx-auto rounded-lg shadow-lg border border-gray-600"
                  style={{ maxHeight: '600px' }}
                  onError={(e) => {
                    console.error('Image failed to load:', certificate.file_url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400 mb-4">
                Click download to access the full-resolution file.
              </p>
              <Button onClick={downloadCertificate} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        {certificate.profiles && (
          <Card className="mb-8 bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Certificate Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {certificate.profiles.avatar_url ? (
                  <img
                    src={certificate.profiles.avatar_url}
                    alt={certificate.profiles.display_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                    {certificate.profiles.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white">{certificate.profiles.display_name}</h3>
                  <p className="text-gray-400">@{certificate.profiles.username}</p>
                  <Link
                    to={`/u/${certificate.profiles.username}`}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    View all certificates →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Share Options */}
        <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Share This Certificate</CardTitle>
            <CardDescription className="text-gray-300">
              Anyone with this link can view this certificate without needing to sign up
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="flex-1 p-3 bg-gray-800 rounded-lg font-mono text-sm text-gray-300 break-all border border-gray-600">
                {certificateUrl}
              </div>
              <Button onClick={copyToClipboard} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificateView;
