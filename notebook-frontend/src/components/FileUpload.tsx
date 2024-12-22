import React, { useState } from 'react';
import { Check, File, Upload } from 'lucide-react';

export const FileUploadEditor = () => {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // TODO: Add file upload to S3 and save to public/upload for backend server.
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: "POST",
        body: formData,
      });

      const { filePath } = await response.json();
      setUploadedFile(filePath);
    } catch (error) {
      console.error("Error uploading files: ", error);
    }
  };

  return (
    <div className="p-4 space-y-3">
      <input
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
        accept=".csv,.json"
      />
      <label
        htmlFor="file-upload"
        className="flex items-center justify-center w-full h-16 px-4 transition bg-muted border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-muted-foreground focus:outline-none"
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className="w-6 h-6" />
          <span className="text-sm">Drop files or click to upload</span>
          {!uploadedFile && (
            <span className="text-sm text-muted-foreground">No file chosen</span>
          )}
        </div>
      </label>

      {uploadedFile && (
        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <File className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-medium truncate">
                {uploadedFile.split('/').pop()}
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {uploadedFile.split('/').slice(1).join('/')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
