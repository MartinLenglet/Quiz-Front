import { z } from "zod";

export const UploadedImageSchema = z.object({
  id: z.number().int(),
  key: z.string(),
  bytes: z.number().int(),
  mime: z.string(),
});

export type UploadedImage = z.infer<typeof UploadedImageSchema>;
