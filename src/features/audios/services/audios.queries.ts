import { useMutation } from "@tanstack/react-query";
import { uploadAudio } from "./audios.services";
import type { UploadedAudio } from "../schemas/audios.schemas";

export function useUploadAudioMutation() {
  return useMutation<UploadedAudio, Error, { file: File }>({
    mutationFn: ({ file }) => uploadAudio(file),
  });
}
