package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.*

class SemanticAstComparer(baseAst: Ast) {
    private val normalized = normalize(baseAst)

    fun compare(other: Ast): Boolean {
        val otherNorm = normalize(other)
        println(normalized)
        println(otherNorm)
        return otherNorm == normalized
    }

    private fun normalize(baseAst: Ast): Ast =
        Ast(normalize(baseAst.root))

    private fun normalize(operation: Operation): Expr {
        val normalizedLeft = normalize(operation.left)
        val normalizedRight = normalize(operation.right)

        if (operation.operator == Operator.MUL) {
            if (normalizedLeft == Num(1)) {
                return normalizedRight
            } else if (normalizedRight == Num(1)) {
                return normalizedLeft
            }
        }

        if ((operation.operator == Operator.ADD || operation.operator == Operator.MUL) &&
            normalizedLeft.toString() > normalizedRight.toString()) {
            return Operation(operation.operator, normalizedRight, normalizedLeft)
        }

        return Operation(operation.operator, normalizedLeft, normalizedRight)
    }

    private fun normalize(expr: Expr): Expr = if (expr is Operation) normalize(expr) else expr
}
