package de.thm.ii.fbs.mathParser.transformers

import de.thm.ii.fbs.mathParser.ast.*
import java.math.BigDecimal

class NegativeNumberTransformer : BaseTransformer() {
    override fun transformNumber(input: Num): Expr =
        if (input.content < BigDecimal.ZERO) UnaryOperation(Operator.SUB, Num(input.content.abs()))
        else input
}
