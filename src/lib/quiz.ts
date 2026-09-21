// Builds a lesson's practice: a mix of exercise kinds in three parts that get harder: recognise, recall, produce.
// Exists as a pure function so the practice can be tested without rendering. Its length follows the number of phrases.
import type { Phrase } from './types'
import { fillGapExercise, meaningExercise, recallExercise, shuffle, soundsLikeExercise, trueFalseExercise, type ChoiceExercise } from './quizChoice'
import { buildExercise, matchExercise, typeExercise, type BuildExercise, type MatchExercise, type TypeExercise } from './quizProduce'

export type Exercise = ChoiceExercise | MatchExercise | BuildExercise | TypeExercise

export const PART_TITLES: Record<1 | 2 | 3, string> = { 1: 'Recognise', 2: 'Recall', 3: 'Produce' }

// phrases are the ones being taught. pool is where wrong answers come from, ideally the whole bank.
export function buildQuiz(phrases: Phrase[], pool: Phrase[] = phrases, random: () => number = Math.random): Exercise[] {
  const everything = [...phrases, ...pool.filter((p) => !phrases.some((q) => q.id === p.id))]
  if (everything.length < 2) return []
  const othersOf = (phrase: Phrase) => everything.filter((p) => p.id !== phrase.id)
  const order = shuffle(phrases, random)

  // Part 1, recognise: meaning and true or false take turns, then one round of matching pairs.
  const recognise: Exercise[] = []
  order.forEach((phrase, i) => {
    const exercise = i % 2 === 0 ? meaningExercise(phrase, othersOf(phrase), random) : trueFalseExercise(phrase, othersOf(phrase), random)
    if (exercise) recognise.push(exercise)
  })
  const match = matchExercise(phrases, random)

  // Part 2, recall: from English to Swahili, and from the pronunciation guide to the phrase.
  const recall: Exercise[] = []
  shuffle(phrases, random).forEach((phrase, i) => {
    const exercise = (i % 2 === 1 && soundsLikeExercise(phrase, othersOf(phrase), random)) || recallExercise(phrase, othersOf(phrase), random)
    if (exercise) recall.push(exercise)
  })

  // Part 3, produce: build sentences from tiles and fill gaps for longer phrases, type the short ones.
  const produce: Exercise[] = []
  let longPhrases = 0
  for (const phrase of shuffle(phrases, random)) {
    const built = buildExercise(phrase, othersOf(phrase), random)
    if (built) {
      const exercise = longPhrases % 2 === 0 ? built : fillGapExercise(phrase, othersOf(phrase), random) ?? built
      produce.push(exercise)
      longPhrases++
    } else {
      const typed = typeExercise(phrase)
      if (typed) produce.push(typed)
    }
  }

  return [...recognise, ...(match ? [match] : []), ...recall, ...produce]
}
