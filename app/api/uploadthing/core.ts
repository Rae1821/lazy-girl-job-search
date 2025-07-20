// import { addUploadedImages } from '@/actions/auth';
import { addUploadedResume } from '@/actions/auth';
import { auth } from '@/auth';
// import { cookies } from "next/headers";
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

// const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    pdf: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({}) => {
      // This code runs on your server before upload

      const session = await auth();
      const user = session?.user;
      const userEmail = session?.user?.email;
      const userId = user?.id;

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError('Unauthorized');

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userEmail: userEmail, userId: userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      const newResume = await addUploadedResume({
        id: metadata.userId ?? '',
        email: metadata.userEmail ?? '',
        resume_url: file.ufsUrl ?? '',
        resume_name: file.name ?? '',
      });

      console.log(newResume);
      console.log('Upload complete for userId:', metadata.userId);

      console.log('file url', file.ufsUrl);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { newResume, uploadedBy: metadata.userEmail };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
