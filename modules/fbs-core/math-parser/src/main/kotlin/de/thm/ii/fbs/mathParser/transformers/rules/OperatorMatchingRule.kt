package de.thm.ii.fbs.mathParser.transformers.rules

import de.thm.ii.fbs.mathParser.ast.Expr
import de.thm.ii.fbs.mathParser.ast.Operation
import de.thm.ii.fbs.mathParser.ast.Operator
import de.thm.ii.fbs.mathParser.transformers.rules.transformers.OperationTransformer

class OperatorMatchingRule(
    private val operator: Operator,
    private val transformer: OperationTransformer
) : OperationRule() {
    override fun matchesOperation(operation: Operation): Boolean = operation.operator == operator
    override fun applyOperation(operation: Operation): Expr = transformer.transform(operation)
}
