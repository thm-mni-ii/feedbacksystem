package de.thm.ii.fbs.model.v2.checker.excel.handler

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.handler.context.ErrorAnalysisContext
import de.thm.ii.fbs.model.v2.checker.excel.result.AnalysisResult
import de.thm.ii.fbs.utils.v2.handler.Handle
import de.thm.ii.fbs.utils.v2.handler.When
import org.apache.poi.ss.usermodel.FormulaError
import org.apache.poi.xssf.usermodel.XSSFCell
import org.apache.poi.xssf.usermodel.XSSFWorkbook

@Handle(When.ONINVALIDFORMULA)
class InvalidFormulaFeedbackHandler(result: AnalysisResult, private val submissionSheet: XSSFWorkbook) :
    ResultHandler(result) {
    private val alreadyStored: MutableSet<Cell> = mutableSetOf()

    override fun handle(input: ErrorAnalysisContext) {
        if (alreadyStored.contains(input.submissionCell)) return

        val feedback = errorCodeToFeedback(input.submissionCell?.xssfCell(submissionSheet))

        if (!feedback.isNullOrBlank()) {
            result.getCellResult(input.submissionCell!!).addFeedback(feedback)
            alreadyStored.add(input.submissionCell)
        }
    }

    private fun errorCodeToFeedback(cell: XSSFCell?): String? {
        if (cell === null) return null
        // TODO: include more information, e.g. the invalid reference

        return when (cell.errorCellValue) {
            FormulaError.NULL.code -> buildErrorCodeFeedback(cell, "Zwei Bereiche sollten sich überlappen")
            FormulaError.DIV0.code -> buildErrorCodeFeedback(cell, "Division durch Null")
            FormulaError.VALUE.code -> buildErrorCodeFeedback(
                cell,
                "Ein übergebenes Argument hat einen inkompatiblen Typ oder die Typen von zwei Operanden sind inkompatibel"
            )

            FormulaError.REF.code -> buildErrorCodeFeedback(cell, "Ein oder mehrere Zellbezüge sind ungültig")
            FormulaError.NAME.code -> buildErrorCodeFeedback(cell, "Einer der verwendeten Namen existiert nicht")
            FormulaError.NUM.code -> buildErrorCodeFeedback(
                cell,
                "Domänenfehler - Der Wert eines Arguments einer Funktion liegt außerhalb des zulässigen Wertebereichs"
            )

            FormulaError.NA.code -> buildErrorCodeFeedback(cell, "Ein angegebener Wert ist nicht verfügbar")
            FormulaError.CIRCULAR_REF.code -> buildErrorCodeFeedback(cell, "Zirkelbezug in der Formel")
            FormulaError.FUNCTION_NOT_IMPLEMENTED.code -> buildErrorCodeFeedback(
                cell,
                "Eine der verwendeten Funktionen ist nicht implementiert"
            )

            else -> null
        }
    }

    private fun buildErrorCodeFeedback(cell: XSSFCell, msg: String): String {
        return "Ungültige Formel: $msg. `${cell.errorCellString}`"
    }
}