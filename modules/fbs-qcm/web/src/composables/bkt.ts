// ============================================================
// bkt.ts
// Bayesian Knowledge Tracing Modell
//
// Quelle: Corbett & Anderson (1994)
// "Knowledge Tracing: Modeling the Acquisition of Procedural Knowledge"
// User Modeling and User-Adapted Interaction, 4(4), 253–278
// ============================================================

import type { BKTParams, SkillState } from './types'
import { DEFAULT_BKT_PARAMS } from './types'

// ------------------------------------------------------------
// Kern-Formeln (Hidden Markov Model)
// ------------------------------------------------------------

/**
 * Schritt 1: P(L | korrekte Antwort)
 *
 * Wenn der Student richtig antwortet, unterscheiden wir:
 * - Hat er es wirklich gewusst (pLearned) und nicht geslippt?
 * - Oder hat er geraten (1 - pLearned) und Glück gehabt?
 *
 * Bayes: P(L | correct) = P(correct | L) * P(L) / P(correct)
 *   P(correct | L)     = 1 - pSlip
 *   P(correct | not L) = pGuess
 *   P(correct)         = P(L)*(1-pSlip) + (1-P(L))*pGuess
 */
export function updateCorrect(pLearned: number, params: BKTParams): number {
  const { pSlip, pGuess } = params

  const pCorrectGivenLearned = 1 - pSlip
  const pCorrectGivenNotLearned = pGuess
  const pCorrect =
    pLearned * pCorrectGivenLearned + (1 - pLearned) * pCorrectGivenNotLearned

  // P(L | correct) – vor dem Transit
  const pLearnedGivenCorrect =
    (pCorrectGivenLearned * pLearned) / pCorrect

  return applyTransit(pLearnedGivenCorrect, params)
}

/**
 * Schritt 2: P(L | falsche Antwort)
 *
 * Analog: Hat er es nicht gewusst (1-pLearned) und nicht geraten?
 * Oder hat er es gewusst (pLearned) und sich vertan (Slip)?
 *
 * P(L | incorrect) = P(incorrect | L) * P(L) / P(incorrect)
 */
export function updateIncorrect(pLearned: number, params: BKTParams): number {
  const { pSlip, pGuess } = params

  const pIncorrectGivenLearned = pSlip
  const pIncorrectGivenNotLearned = 1 - pGuess
  const pIncorrect =
    pLearned * pIncorrectGivenLearned + (1 - pLearned) * pIncorrectGivenNotLearned

  const pLearnedGivenIncorrect =
    (pIncorrectGivenLearned * pLearned) / pIncorrect

  return applyTransit(pLearnedGivenIncorrect, params)
}

/**
 * Schritt 3: Lernfortschritt (Transit) anwenden.
 *
 * Auch wenn der Student die Frage noch nicht konnte,
 * steigt P(L) durch den Lerneffekt der Auseinandersetzung.
 *
 * P(L_n+1) = P(L_n | evidence) + (1 - P(L_n | evidence)) * pTransit
 */
function applyTransit(pLearnedGivenEvidence: number, params: BKTParams): number {
  const { pTransit } = params
  return pLearnedGivenEvidence + (1 - pLearnedGivenEvidence) * pTransit
}

// ------------------------------------------------------------
// Öffentliche API
// ------------------------------------------------------------

/**
 * Aktualisiert den SkillState nach einer Antwort.
 * Gibt den neuen State zurück (immutabel).
 *
 * @param state     Aktueller SkillState
 * @param isCorrect War die Antwort korrekt?
 * @param params    BKT-Parameter für diesen Skill
 * @param threshold Ab wann gilt der Skill als gemeistert?
 * @param minAnswers Mindestanzahl Antworten vor Mastery-Check
 */
export function applyAnswer(
  state: SkillState,
  isCorrect: boolean,
  params: BKTParams = DEFAULT_BKT_PARAMS,
  threshold: number = 0.75,
  minAnswers: number = 3,
): SkillState {
  const updatedPLearned = isCorrect
    ? updateCorrect(state.pLearned, params)
    : updateIncorrect(state.pLearned, params)

  const newTimesAsked = state.timesAsked + 1
  const mastered =
    !state.mastered &&
    newTimesAsked >= minAnswers &&
    updatedPLearned >= threshold
      ? true
      : state.mastered

  return {
    ...state,
    pLearned: updatedPLearned,
    timesAsked: newTimesAsked,
    lastAskedAt: Date.now(),
    mastered,
  }
}

/**
 * Initialisiert einen SkillState für einen neu freigeschalteten Skill.
 *
 * @param skillId   ID des Skills
 * @param unlocked  Ist der Skill von Anfang an zugänglich? (kein Prerequisite)
 * @param params    BKT-Parameter (pInit als Startwert)
 */
export function initSkillState(
  skillId: string,
  unlocked: boolean,
  params: BKTParams = DEFAULT_BKT_PARAMS,
): SkillState {
  return {
    skillId,
    pLearned: params.pInit,
    unlocked,
    mastered: false,
    lastAskedAt: null,
    timesAsked: 0,
  }
}

/**
 * Gibt die Wahrscheinlichkeit einer richtigen Antwort zurück.
 * Nützlich für Debugging und Fortschrittsanzeigen.
 *
 * P(correct) = P(L)*(1-pSlip) + (1-P(L))*pGuess
 */
export function pCorrect(pLearned: number, params: BKTParams): number {
  return pLearned * (1 - params.pSlip) + (1 - pLearned) * params.pGuess
}
