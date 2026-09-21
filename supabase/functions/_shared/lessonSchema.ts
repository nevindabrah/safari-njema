// The zod schema for a lesson's JSON. Used by the Edge Function to validate model output
// and by the browser to type lesson content. Exists so there is one definition of a lesson.
import { z } from 'zod'

export const lessonSchema = z.object({
  place: z.object({
    name: z.string(),
    type: z.string(),
  }),
  brief: z.object({
    what_it_is: z.string().min(1),
    know_today: z.array(z.string()).min(1).max(5),
    etiquette: z.string().min(1),
    practical: z.string().min(1),
  }),
  phrases: z
    .array(z.object({ phrase_id: z.string().uuid(), why_here: z.string() }))
    .min(1)
    .max(8),
  new_phrases: z
    .array(
      z.object({
        swahili: z.string(),
        pronunciation: z.string(),
        english: z.string(),
        tags: z.array(z.string()),
      }),
    )
    .max(2)
    .default([]),
})

export type Lesson = z.infer<typeof lessonSchema>
