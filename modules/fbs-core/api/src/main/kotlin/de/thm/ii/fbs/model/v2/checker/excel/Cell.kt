package de.thm.ii.fbs.model.v2.checker.excel

data class Cell(val sheet: Int, val cell: String) {
    companion object {
        const val SHEET_DELIMITER = "!"  // TODO implement delimiter for ODF
    }
}
