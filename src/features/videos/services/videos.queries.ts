import { useMutation } from "@tanstack/react-query";
import { uploadVideo } from "./videos.services";
import type { UploadedVideo } from "../schemas/videos.schemas";

export function useUploadVideoMutation() {
  return useMutation<UploadedVideo, Error, { file: File }>({
    mutationFn: ({ file }) => uploadVideo(file),
  });
}
