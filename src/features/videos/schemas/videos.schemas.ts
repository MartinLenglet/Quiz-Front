import { z } from "zod";

export const UploadedVideoSchema = z.object({
  id: z.number().int(),
  key: z.string(),
  bytes: z.number().int(),
  mime: z.string(),
});

export type UploadedVideo = z.infer<typeof UploadedVideoSchema>;
