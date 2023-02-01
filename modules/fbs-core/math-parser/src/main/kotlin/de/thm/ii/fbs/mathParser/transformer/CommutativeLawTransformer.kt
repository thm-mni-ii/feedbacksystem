package de.thm.ii.fbs.mathParser.transformer

import de.thm.ii.fbs.mathParser.ast.*

class CommutativeLawTransformer : BaseTransformer() {
    override fun transformOperation(input: Operation): Expr {
        if ((input.operator == Operator.ADD || input.operator == Operator.MUL)) {
            val normalizedLeft = transformExpresion(input.left)
            val normalizedRight = transformExpresion(input.right)

            val collected = treeCollect(normalizedLeft, input.operator) + treeCollect(normalizedRight, input.operator)
            val sorted = collected.sortedByDescending { it.toString() }

            return retree(sorted, input.operator)
        }

        return super.transformOperation(input)
    }

    private fun treeCollect(operation: Operation, parentOperator: Operator): List<Expr> =
        if (operation.operator == parentOperator)
            treeCollect(operation.left, operation.operator) + treeCollect(operation.right, operation.operator)
        else
            listOf(operation)

    private fun treeCollect(expr: Expr, parentOperator: Operator): List<Expr> =
        if (expr is Operation) treeCollect(expr, parentOperator) else listOf(expr)

    private fun retree(exprs: List<Expr>, operator: Operator): Operation =
        Operation(operator, if (exprs.size > 2) retree(exprs.subList(1, exprs.size), operator) else exprs[1], exprs[0])
}
