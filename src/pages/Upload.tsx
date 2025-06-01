
import { useState, useRef } from "react";
import { Upload as UploadIcon, FileText, Image, X, CheckCircle } from "lucide-react";
import Navigation from "../components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const UploadPage = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedCertificates, setUploadedCertificates] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issuer, setIssuer] = useState("");
  const [date, setDate] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
    });
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
    });
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload certificates.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!title || !issuer || !date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (title, issuer, and date).",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const uploadedIds: string[] = [];

    try {
      for (const file of selectedFiles) {
        console.log('Uploading file:', file.name);
        
        // Create unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('certificates')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        console.log('File uploaded successfully:', uploadData);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('certificates')
          .getPublicUrl(fileName);

        console.log('Public URL:', urlData.publicUrl);

        // Save certificate record to database
        const { data: certData, error: certError } = await supabase
          .from('certificates')
          .insert({
            user_id: user.id,
            title: title,
            description: description || null,
            issuer: issuer,
            issue_date: date,
            file_url: urlData.publicUrl,
            file_type: file.type,
            is_public: isPublic,
            views: 0
          })
          .select()
          .single();

        if (certError) {
          console.error('Database error:', certError);
          throw certError;
        }

        console.log('Certificate saved to database:', certData);
        uploadedIds.push(certData.id);
      }

      setUploadedCertificates(uploadedIds);
      setUploadSuccess(true);
      toast({
        title: "Upload Successful!",
        description: `${selectedFiles.length} certificate(s) uploaded successfully.`,
      });

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-400" />;
    }
    return <Image className="w-8 h-8 text-blue-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center px-4 py-20">
          <div className="w-full max-w-md text-center bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Upload Successful!</h2>
            <p className="text-gray-400 mb-6">Your certificates have been uploaded and are now available in your profile.</p>
            
            {uploadedCertificates.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-300 mb-3">Shareable links:</p>
                <div className="space-y-2">
                  {uploadedCertificates.map((certId) => (
                    <div key={certId} className="bg-gray-700 rounded p-2">
                      <code className="text-xs text-blue-400 break-all">
                        {window.location.origin}/c/{certId}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={() => {
                  setUploadSuccess(false);
                  setSelectedFiles([]);
                  setUploadedCertificates([]);
                  setTitle("");
                  setDescription("");
                  setIssuer("");
                  setDate("");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                Upload More Certificates
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Certificates</h1>
          <p className="text-gray-400">Share your achievements with the world</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-2">Select Files</h2>
            <p className="text-gray-400 mb-6">Upload PDF files or images (JPG, PNG). Maximum file size: 10MB per file.</p>
            
            <div
              className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-750"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-white mb-2">Drop files here or click to browse</p>
              <p className="text-sm text-gray-400">Supports PDF, JPG, PNG files</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-white mb-3">Selected Files ({selectedFiles.length})</h3>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="font-medium text-white truncate max-w-xs">{file.name}</p>
                          <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Certificate Details */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-2">Certificate Details</h2>
            <p className="text-gray-400 mb-6">Add details to help others understand your certificates better.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., AWS Certified Solutions Architect"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details about the certification, when you received it, or any relevant context..."
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Issuing Organization *</label>
                <input
                  type="text"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="e.g., Amazon Web Services"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date Issued *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-300">
                  Make certificate public (allows others to view it)
                </label>
              </div>

              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading || !title || !issuer || !date}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4" />
                    <span>Upload {selectedFiles.length} Certificate{selectedFiles.length !== 1 ? 's' : ''}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
