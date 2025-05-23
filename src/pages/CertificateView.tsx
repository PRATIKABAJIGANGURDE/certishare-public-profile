
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Download, Eye, Calendar, Building, Copy, ArrowLeft } from "lucide-react";

// Mock data - in real app this would be fetched based on certId
const mockCertificate = {
  id: "cert-1",
  title: "AWS Certified Solutions Architect - Associate",
  issuer: "Amazon Web Services",
  dateIssued: "2024-03-15",
  description: "This certification validates technical expertise in designing distributed applications and systems on AWS. The credential demonstrates knowledge of AWS services, security best practices, cost optimization, and architectural principles for building resilient systems in the cloud.",
  fileUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
  type: "pdf",
  views: 324,
  isPublic: true,
  owner: {
    name: "John Doe",
    username: "johndoe",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  tags: ["AWS", "Cloud Architecture", "Solutions Architect", "Associate Level"]
};

const CertificateView = () => {
  const { certId } = useParams();
  const [copiedLink, setCopiedLink] = useState(false);
  const [viewCount, setViewCount] = useState(mockCertificate.views);

  const certificateUrl = `${window.location.origin}/c/${certId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(certificateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Simulate view increment (in real app, this would be handled by backend)
  useState(() => {
    const timer = setTimeout(() => {
      setViewCount(prev => prev + 1);
    }, 1000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to={`/u/${mockCertificate.owner.username}`} className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {mockCertificate.owner.name}'s Profile
            </Link>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="flex items-center space-x-2"
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
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Certificate Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{mockCertificate.title}</CardTitle>
                <CardDescription className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>{mockCertificate.issuer}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Issued {formatDate(mockCertificate.dateIssued)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{viewCount.toLocaleString()} views</span>
                  </div>
                </CardDescription>
                <p className="text-gray-700 mb-4">{mockCertificate.description}</p>
                <div className="flex flex-wrap gap-2">
                  {mockCertificate.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Certificate Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Certificate Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <img
                src={mockCertificate.fileUrl}
                alt={mockCertificate.title}
                className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                style={{ maxHeight: '600px' }}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-4">
                This is a preview of the certificate. Click download to get the full-resolution file.
              </p>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download Full Certificate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle>Certificate Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <img
                src={mockCertificate.owner.avatar}
                alt={mockCertificate.owner.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{mockCertificate.owner.name}</h3>
                <p className="text-gray-600">@{mockCertificate.owner.username}</p>
                <Link
                  to={`/u/${mockCertificate.owner.username}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all certificates →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Options */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Share This Certificate</CardTitle>
            <CardDescription>
              Anyone with this link can view this certificate without needing to sign up
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="flex-1 p-3 bg-gray-100 rounded-lg font-mono text-sm text-gray-700">
                {certificateUrl}
              </div>
              <Button onClick={copyToClipboard} variant="outline">
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
