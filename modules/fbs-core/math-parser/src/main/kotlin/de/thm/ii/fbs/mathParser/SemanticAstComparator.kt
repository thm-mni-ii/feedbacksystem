package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.*
import java.math.BigDecimal
import java.math.RoundingMode

class SemanticAstComparator(private val decimals: Int, private val roundingMode: RoundingMode = RoundingMode.HALF_UP) {
    private val one = Num(BigDecimal(1).setScale(decimals, roundingMode))

    fun compare(base: Ast, other: Ast): Boolean {
        val l = normalize(base)
        val r = normalize(other)
        println(l)
        println(r)
        return l == r
    }

    private fun normalize(baseAst: Ast): Ast =
        Ast(normalize(baseAst.root))

    private fun normalize(operation: Operation): Expr {
        val normalizedLeft = normalize(operation.left)
        val normalizedRight = normalize(operation.right)

        if (operation.operator == Operator.MUL) {
            if (normalizedLeft == one) {
                return normalizedRight
            } else if (normalizedRight == one) {
                return normalizedLeft
            }
        }

        if ((operation.operator == Operator.ADD || operation.operator == Operator.MUL) &&
            normalizedLeft.toString() > normalizedRight.toString()) {
            return Operation(operation.operator, normalizedRight, normalizedLeft)
        }

        return Operation(operation.operator, normalizedLeft, normalizedRight)
    }

    private fun normalize(number: Num): Expr =
        Num(number.content.setScale(decimals, roundingMode))

    private fun normalize(expr: Expr): Expr =
        if (expr is Operation) normalize(expr) else if (expr is Num) normalize(expr) else expr
}
