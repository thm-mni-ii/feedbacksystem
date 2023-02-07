package de.thm.ii.fbs.mathParser.transformer

import java.math.BigDecimal
import java.math.RoundingMode

data class TransformerConfig(val decimals: Int, val roundingMode: RoundingMode = RoundingMode.HALF_UP) {
    fun setScale(number: BigDecimal): BigDecimal =
        number.setScale(decimals, roundingMode)
}
