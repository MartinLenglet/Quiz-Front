import { httpRequest } from "@/lib/api";
import { UploadedImageSchema, type UploadedImage } from "../schemas/images.schemas";

export async function uploadImage(file: File): Promise<UploadedImage> {
  const form = new FormData();
  form.append("file", file);

  return httpRequest<UploadedImage>({
    method: "POST",
    path: "/images/upload", // SANS /v1 (proxy Vite)
    body: form,             // FormData via httpRequest
    responseSchema: UploadedImageSchema,
    withAuth: true,
  });
}
