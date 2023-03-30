package de.thm.ii.fbs.mathParser.transformers

import de.thm.ii.fbs.mathParser.ast.Expr
import de.thm.ii.fbs.mathParser.ast.Num
import de.thm.ii.fbs.mathParser.ast.Operator
import de.thm.ii.fbs.mathParser.ast.UnaryOperation
import java.math.BigDecimal
import java.math.RoundingMode

data class TransformerConfig(val decimals: Int, val roundingMode: RoundingMode = RoundingMode.HALF_UP) {
    fun exprFromInt(i: Int): Expr = Num(setScale(BigDecimal(i))).let { if (i >= 0) it else UnaryOperation(Operator.SUB, it) }
    fun setScale(number: BigDecimal): BigDecimal =
        number.setScale(decimals, roundingMode)
}
