package de.thm.ii.fbs.mathParser.transformers.rules

import de.thm.ii.fbs.mathParser.ast.Expr
import de.thm.ii.fbs.mathParser.ast.Operation
import de.thm.ii.fbs.mathParser.ast.Operator
import de.thm.ii.fbs.mathParser.transformers.rules.transformers.ExprTransformer

class OperandMatchingRule(
    private val operator: Operator,
    private val operandEquals: Expr,
    private val matchLeftOperand: Boolean = true,
    private val matchRightOperand: Boolean = true,
    private val exprTransformer: ExprTransformer = ExprTransformer {it}
) : OperationRule() {
    override fun matchesOperation(operation: Operation): Boolean = operator == operation.operator && (
        (matchLeftOperand && operandEquals == operation.left) ||
        (matchRightOperand && operandEquals == operation.right)
    )

    override fun applyOperation(operation: Operation): Expr {
        if (matchLeftOperand && operation.left == operandEquals) {
            return exprTransformer.transform(operation.right)
        }
        if (matchRightOperand && operation.right == operandEquals) {
            return exprTransformer.transform(operation.left)
        }
        throw IllegalArgumentException("operation passed to apply does not match")
    }
}
