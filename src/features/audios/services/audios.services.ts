import { httpRequest } from "@/lib/api";
import { UploadedAudioSchema, type UploadedAudio } from "../schemas/audios.schemas";

export async function uploadAudio(file: File): Promise<UploadedAudio> {
  const form = new FormData();
  form.append("file", file);

  return httpRequest<UploadedAudio>({
    method: "POST",
    path: "/audios/upload", // SANS /v1 (proxy Vite)
    body: form,             // FormData via httpRequest
    responseSchema: UploadedAudioSchema,
    withAuth: true,
  });
}
