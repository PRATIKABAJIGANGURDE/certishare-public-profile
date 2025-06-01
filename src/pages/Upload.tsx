
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload as UploadIcon, FileText, Image as ImageIcon } from "lucide-react";
import Navigation from "../components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

const Upload = () => {
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Maximum file size: 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF or image file (JPEG, PNG).",
          variant: "destructive",
        });
        e.target.value = ''; // Clear the input
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload certificates.",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a certificate file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !issuer.trim() || !issueDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create a unique filename with user ID prefix for organization
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      console.log('Uploading file:', fileName, 'Size:', file.size, 'Type:', file.type);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully:', uploadData);

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // Save certificate metadata to database
      const { data: certData, error: dbError } = await supabase
        .from('certificates')
        .insert({
          title: title.trim(),
          issuer: issuer.trim(),
          issue_date: issueDate,
          description: description.trim() || null,
          file_url: publicUrl,
          file_type: file.type,
          is_public: isPublic,
          user_id: user.id
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('certificates').remove([fileName]);
        throw dbError;
      }

      console.log('Certificate saved to database:', certData);

      toast({
        title: "Certificate uploaded successfully!",
        description: "Your certificate has been uploaded and is now available.",
      });

      // Navigate to the certificate view page
      navigate(`/c/${certData.id}`);

    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <UploadIcon className="w-8 h-8 text-gray-400" />;
    
    if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-400" />;
    }
    return <ImageIcon className="w-8 h-8 text-blue-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Upload Certificate</CardTitle>
            <CardDescription className="text-gray-400">
              Share your achievements with the world. Upload your certificates and make them discoverable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="file" className="text-white">Certificate File *</Label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                  <input
                    id="file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <div className="flex flex-col items-center space-y-2">
                      {getFileIcon()}
                      {file ? (
                        <div className="text-center">
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-white">Click to upload certificate</p>
                          <p className="text-gray-400 text-sm">PDF, JPEG, PNG (max 10MB)</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Certificate Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., AWS Solutions Architect"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuer" className="text-white">Issuing Organization *</Label>
                  <Input
                    id="issuer"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    placeholder="e.g., Amazon Web Services"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDate" className="text-white">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional details about this certificate..."
                  className="bg-gray-700 border-gray-600 text-white resize-none"
                  rows={3}
                />
              </div>

              {/* Privacy Setting */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <Label htmlFor="isPublic" className="text-white font-medium">Make Public</Label>
                  <p className="text-gray-400 text-sm">Allow others to discover and view this certificate</p>
                </div>
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={uploading || !file}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
              >
                {uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <UploadIcon className="w-4 h-4" />
                    <span>Upload Certificate</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
