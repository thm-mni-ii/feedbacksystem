package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.*

object SemanticAstComparer {
    @JvmStatic
    fun compare(base: Ast, other: Ast): Boolean =
        normalize(base) == normalize(other)

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
