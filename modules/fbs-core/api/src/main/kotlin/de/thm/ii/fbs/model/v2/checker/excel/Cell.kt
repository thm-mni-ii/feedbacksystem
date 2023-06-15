package de.thm.ii.fbs.model.v2.checker.excel

import com.fasterxml.jackson.annotation.JsonProperty

data class CellXYZ(@JsonProperty("sheet") val sheet: Int, @JsonProperty("cell") val cell: String) {
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

    fun toMapKey(): String {
        return "${this.cell}@${this.sheet}"
    }
}
