import { z } from "zod";

export const itemSchema = z.object({
  title: z.string().min(1),
  poster_image: z.string().url().nullable().optional(),
  type: z.enum(["movie", "tv", "book", "comic"]),
  source: z.string().min(1),
  external_id: z.string().min(1),
  notes: z.string().max(500).optional().nullable()
});
