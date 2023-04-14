package de.thm.ii.fbs.mathParser.transformers

import de.thm.ii.fbs.mathParser.ast.Operation
import de.thm.ii.fbs.mathParser.ast.Operator
import de.thm.ii.fbs.mathParser.ast.UnaryOperation
import de.thm.ii.fbs.mathParser.transformers.rules.OperatorMatchingRule

class SubReplacingTransformer : RuleBasedTransformer(
    OperatorMatchingRule(Operator.SUB) {Operation(Operator.ADD, it.left, UnaryOperation(Operator.SUB, it.right))}
)
