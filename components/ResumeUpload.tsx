'use client';

import { UploadDropzone } from '@/utils/uploadthing';
import Image from 'next/image';
import { useState } from 'react';

interface ResumeUploadProps {
  onUploadComplete?: (resumeUrl: string, resumeName?: string) => void;
}

const ResumeUpload = ({ onUploadComplete }: ResumeUploadProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageName, setImageName] = useState<string>('');

  return (
    <>
      <UploadDropzone
        appearance={{
          button: 'bg-transparent',
        }}
        className="w-md bg-zinc-900 ut-label:text-lg ut-allowed-content:ut-uploading:text-teal-400 h-96"
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          console.log('Files: ', res);
          const uploadedUrl = res[0]?.url || res[0]?.ufsUrl || '';
          const uploadedName = res[0]?.name || '';
          setImageUrl(uploadedUrl);
          setImageName(uploadedName);

          // Call the callback if provided
          if (onUploadComplete && uploadedUrl) {
            onUploadComplete(uploadedUrl, uploadedName);
          }
        }}
        onUploadError={(error: Error) => {
          console.error('Upload failed:', error);
        }}
      />

      <div>
        {imageUrl && (
          <p>
            Uploaded Complete. You can view your uploaded resume by clicking on
            your account
          </p>
        )}
      </div>
    </>
  );
};

export default ResumeUpload;
