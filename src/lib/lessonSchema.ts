// Re-exports the lesson schema that lives next to the Edge Function.
// Exists so browser code imports from lib/ like the PRD says, while there is still one schema file.
export { lessonSchema, type Lesson } from '../../supabase/functions/_shared/lessonSchema'
