import QuestionType from '@/enums/QuestionType'

/**
 * Deutsche Kurzlabel/Icons je Aufgabentyp, angelehnt an die Bezeichnungen aus
 * `EditQuestion.vue` (dort ausführlicher, hier kompakt für Detail-Panels und
 * Auswahl-Dialoge). Zentral gehalten, damit QuestionDetailPanel.vue und
 * CompetencyDetailPanel.vue (Dialog "Bestehende Aufgabe verknüpfen") dieselbe
 * Darstellung verwenden.
 */
export const questionTypeMeta: Record<QuestionType, { label: string; icon: string }> = {
  [QuestionType.Choice]: { label: 'Multiple Choice', icon: 'mdi-checkbox-multiple-marked-outline' },
  [QuestionType.FillInTheBlanks]: { label: 'Lückentext', icon: 'mdi-form-textbox' },
  [QuestionType.Matching]: { label: 'Zuordnung', icon: 'mdi-vector-link' }
}
