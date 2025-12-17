import { useMutation } from "@tanstack/react-query";
import { uploadImage } from "./images.services";
import type { UploadedImage } from "../schemas/images.schemas";

export function useUploadImageMutation() {
  return useMutation<UploadedImage, Error, { file: File }>({
    mutationFn: ({ file }) => uploadImage(file),
  });
}
