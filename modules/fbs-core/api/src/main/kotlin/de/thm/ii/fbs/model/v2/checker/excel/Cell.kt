package de.thm.ii.fbs.model.v2.checker.excel

import com.fasterxml.jackson.annotation.JsonProperty
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetUtils.Companion.formulaOfCell
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetUtils.Companion.sheetIdxOfCell
import de.thm.ii.fbs.utils.v2.spreadsheet.SpreadsheetValueParser.Companion.valueOfCell
import org.apache.poi.ss.util.CellAddress
import org.apache.poi.xssf.usermodel.XSSFCell

data class Cell(@JsonProperty("sheet") val sheet: Int, @JsonProperty("cell") val cell: String) {
    @JsonProperty("value")
    var value: String? = null

    @JsonProperty("formula")
    var formula: String? = null

    companion object {
        const val SHEET_DELIMITER = "!" // TODO implement delimiter for ODF
    }

    constructor(sheet: Int, cell: String, value: String? = null, formula: String? = null) : this(sheet, cell) {
        this.value = value
        this.formula = formula
    }

    constructor(xssfCell: XSSFCell) : this(
        sheetIdxOfCell(xssfCell),
        xssfCell.address.formatAsString(),
        valueOfCell(xssfCell),
        formulaOfCell(xssfCell)
    )

    fun toMapKey(): String {
        return "${this.cell}@${this.sheet}"
    }

    fun cellAddress(): CellAddress =
        CellAddress(cell)
}
