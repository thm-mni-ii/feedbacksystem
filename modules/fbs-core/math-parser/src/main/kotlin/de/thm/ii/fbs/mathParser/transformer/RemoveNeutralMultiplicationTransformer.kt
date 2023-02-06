package de.thm.ii.fbs.mathParser.transformer

import de.thm.ii.fbs.mathParser.ast.*
import java.math.BigDecimal

class RemoveNeutralMultiplicationTransformer(config: TransformerConfig) : BaseTransformer() {
    private val one = Num(config.setScale(BigDecimal(1)))
    private val minusOne = Num(config.setScale(BigDecimal(-1)))

    override fun transformOperation(input: Operation): Expr {
        val normalizedLeft = transformExpresion(input.left)
        val normalizedRight = transformExpresion(input.right)

        if (input.operator == Operator.MUL) {
            when (normalizedLeft) {
                one -> return normalizedRight
                minusOne -> return UnaryOperation(Operator.SUB, normalizedRight)
            }

            when (normalizedRight) {
                one -> return normalizedLeft
                minusOne -> return UnaryOperation(Operator.SUB, normalizedLeft)
            }
        }

        return Operation(input.operator, normalizedLeft, normalizedRight)
    }
}
