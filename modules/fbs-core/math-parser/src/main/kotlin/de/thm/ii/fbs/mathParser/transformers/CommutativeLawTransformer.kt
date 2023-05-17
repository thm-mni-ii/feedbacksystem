@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.mathParser.transformers

import de.thm.ii.fbs.mathParser.ast.*
import de.thm.ii.fbs.mathParser.transformers.rules.OperatorMatchingRule

class CommutativeLawTransformer : RuleBasedTransformer(
    OperatorMatchingRule(Operator.ADD) { normalize(it) },
    OperatorMatchingRule(Operator.MUL) { normalize(it) }
) {
    companion object {
        private fun normalize(input: Operation): Operation {
            val collected = treeCollect(input.left, input.operator) + treeCollect(input.right, input.operator)
            val sorted = collected.sortedByDescending { it.toString() }

            return retree(sorted, input.operator)
        }

        private fun treeCollect(operation: Operation, parentOperator: Operator): List<Expr> =
            if (operation.operator == parentOperator) {
                treeCollect(operation.left, operation.operator) + treeCollect(operation.right, operation.operator)
            } else {
                listOf(operation)
            }

        private fun treeCollect(expr: Expr, parentOperator: Operator): List<Expr> =
            if (expr is Operation) treeCollect(expr, parentOperator) else listOf(expr)

        private fun retree(exprs: List<Expr>, operator: Operator): Operation =
            Operation(operator, if (exprs.size > 2) retree(exprs.subList(1, exprs.size), operator) else exprs[1], exprs[0])
    }
}
