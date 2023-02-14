package de.thm.ii.fbs.model.v2.checker.excel

data class Cell(val sheet: Int, val cell: String) {
    var value: String? = null
    var formula: String? = null

    companion object {
        const val SHEET_DELIMITER = "!"  // TODO implement delimiter for ODF
    }

    constructor(sheet: Int, cell: String, value: String? = null, formula: String? = null) : this(sheet, cell) {
        this.value = value
        this.formula = formula
    }
}
