import { z } from "zod";

export const UploadedAudioSchema = z.object({
  id: z.number().int(),
  key: z.string(),
  bytes: z.number().int(),
  mime: z.string(),
});

export type UploadedAudio = z.infer<typeof UploadedAudioSchema>;
