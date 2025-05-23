
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Download, Eye, Upload, Copy, Calendar, Building } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - in real app this would come from database
const mockProfile = {
  username: "johndoe",
  name: "John Doe",
  bio: "Senior Software Engineer passionate about cloud technologies and continuous learning.",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  joinDate: "2024-01-15",
  totalCertificates: 8,
  totalViews: 1247
};

const mockCertificates = [
  {
    id: "cert-1",
    title: "AWS Certified Solutions Architect - Associate",
    issuer: "Amazon Web Services",
    dateIssued: "2024-03-15",
    description: "Validates technical expertise in designing distributed applications on AWS.",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=200&fit=crop",
    type: "pdf",
    views: 324,
    isPublic: true
  },
  {
    id: "cert-2",
    title: "React Developer Certification",
    issuer: "Meta",
    dateIssued: "2024-02-10",
    description: "Professional React development skills certification from Meta.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop",
    type: "pdf",
    views: 186,
    isPublic: true
  },
  {
    id: "cert-3",
    title: "Google Cloud Professional Cloud Architect",
    issuer: "Google Cloud",
    dateIssued: "2024-01-22",
    description: "Demonstrates ability to design, develop, and manage robust, secure cloud architecture.",
    thumbnail: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
    type: "pdf",
    views: 298,
    isPublic: true
  },
  {
    id: "cert-4",
    title: "Kubernetes Administrator (CKA)",
    issuer: "Cloud Native Computing Foundation",
    dateIssued: "2023-11-08",
    description: "Certified Kubernetes Administrator credential validates skills in cluster administration.",
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=300&h=200&fit=crop",
    type: "pdf",
    views: 156,
    isPublic: true
  }
];

const ProfilePage = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState("");

  const profileUrl = `${window.location.origin}/u/${mockProfile.username}`;

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-blue-600 hover:text-blue-700">
              ← Back to Home
            </Link>
            <div className="flex items-center space-x-3">
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
              <Link to="/upload">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Certificate
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-6">
              <img
                src={mockProfile.avatar}
                alt={mockProfile.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{mockProfile.name}</h1>
                  <Badge variant="secondary">@{mockProfile.username}</Badge>
                </div>
                <p className="text-gray-600 mb-4 max-w-2xl">{mockProfile.bio}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(mockProfile.joinDate)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Building className="w-4 h-4" />
                    <span>{mockProfile.totalCertificates} Certificates</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{mockProfile.totalViews.toLocaleString()} Total Views</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificates Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Certificates</h2>
            <div className="text-sm text-gray-500">
              {mockCertificates.length} certificate{mockCertificates.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCertificates.map((cert) => (
              <Card key={cert.id} className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <Link to={`/c/${cert.id}`}>
                  <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={cert.thumbnail}
                      alt={cert.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
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
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{cert.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formatDate(cert.dateIssued)}</span>
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
        </div>

        {/* Empty State for New Users */}
        {mockCertificates.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No certificates yet</h3>
              <p className="text-gray-600 mb-6">Start building your professional portfolio by uploading your first certificate.</p>
              <Link to="/upload">
                <Button size="lg">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Your First Certificate
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
