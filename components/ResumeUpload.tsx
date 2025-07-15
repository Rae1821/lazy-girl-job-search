'use client';

import { UploadDropzone } from '@/utils/uploadthing';
import Image from 'next/image';
import { useState } from 'react';

const ResumeUpload = () => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageName, setImageName] = useState<string>('');
  return (
    <div>
      <h2>Upload Your Resume</h2>
      <UploadDropzone
        appearance={{
          button: 'bg-transparent',
        }}
        className="w-md bg-zinc-900 ut-label:text-lg ut-allowed-content:ut-uploading:text-teal-400"
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          console.log('Files: ', res);
          setImageUrl(res[0]?.ufsUrl || '');
          setImageName(res[0]?.name || '');
        }}
        onUploadError={(error: Error) => {
          console.error('Upload failed:', error);
        }}
      />

      <div>
        {imageUrl && (
          <Image src={imageUrl} alt={imageName || 'Uploaded Resume'} />
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
