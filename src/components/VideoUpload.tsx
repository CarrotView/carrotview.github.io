import React, { useState, useCallback } from 'react';
import { Upload, FileVideo, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

const VideoUpload = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: 100, status: 'completed' } : f
        ));
        clearInterval(interval);
        toast({
          title: "Upload Complete!",
          description: "Your video has been uploaded and is ready for AI analysis.",
        });
      } else {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ));
      }
    }, 200);
  };

  const handleFiles = (fileList: FileList) => {
    const validFiles = Array.from(fileList).filter(file => {
      const isVideo = file.type.startsWith('video/');
      const maxSize = 500 * 1024 * 1024; // 500MB
      
      if (!isVideo) {
        toast({
          title: "Invalid File Type",
          description: "Please upload video files only.",
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please upload videos smaller than 500MB.",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading' as const,
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload for each file
    newFiles.forEach(file => {
      setTimeout(() => simulateUpload(file.id), 500);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const { files: droppedFiles } = e.dataTransfer;
    if (droppedFiles?.length) {
      handleFiles(droppedFiles);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files: selectedFiles } = e.target;
    if (selectedFiles?.length) {
      handleFiles(selectedFiles);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isDragOver 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="video-upload"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload Your Videos</h3>
            <p className="text-muted-foreground">
              Drag and drop video files here, or{' '}
              <label htmlFor="video-upload" className="text-primary cursor-pointer hover:underline">
                browse to upload
              </label>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports MP4, AVI, MOV, WMV (max 500MB per file)
            </p>
          </div>

          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            asChild
          >
            <label htmlFor="video-upload" className="cursor-pointer">
              <FileVideo className="w-4 h-4 mr-2" />
              Choose Files
            </label>
          </Button>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-4 bg-card rounded-lg border"
            >
              <div className="flex-shrink-0">
                {file.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : file.status === 'uploading' ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <FileVideo className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {file.status === 'uploading' && (
                  <div className="space-y-1">
                    <Progress value={file.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(file.progress)}% uploaded
                    </p>
                  </div>
                )}
                
                {file.status === 'completed' && (
                  <p className="text-xs text-green-600">
                    ✓ Ready for AI analysis
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoUpload;