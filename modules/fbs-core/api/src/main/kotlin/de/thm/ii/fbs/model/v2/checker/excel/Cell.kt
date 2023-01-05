package de.thm.ii.fbs.model.v2.checker.excel

data class Cell(val sheet: Int, val cell: String, val value: String? = null, val formula: String? = null) {
    companion object {
        const val SHEET_DELIMITER = "!"  // TODO implement delimiter for ODF
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Cell

        if (sheet != other.sheet) return false
        if (cell != other.cell) return false

        return true
    }

    override fun hashCode(): Int {
        var result = sheet
        result = 31 * result + cell.hashCode()
        return result
    }


}
