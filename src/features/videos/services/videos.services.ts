import { httpRequest } from "@/lib/api";
import { UploadedVideoSchema, type UploadedVideo } from "../schemas/videos.schemas";

export async function uploadVideo(file: File): Promise<UploadedVideo> {
  const form = new FormData();
  form.append("file", file);

  return httpRequest<UploadedVideo>({
    method: "POST",
    path: "/videos/upload", // SANS /v1 (proxy Vite)
    body: form,             // FormData via httpRequest
    responseSchema: UploadedVideoSchema,
    withAuth: true,
  });
}
