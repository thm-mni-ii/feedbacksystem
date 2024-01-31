package de.thm.ii.fbs.mathParser.transformers

import de.thm.ii.fbs.mathParser.ast.Operation
import de.thm.ii.fbs.mathParser.ast.Operator
import de.thm.ii.fbs.mathParser.ast.UnaryOperation
import de.thm.ii.fbs.mathParser.transformers.rules.OperatorMatchingRule

class MultiplicationSubTransformer : RuleBasedTransformer(
    OperatorMatchingRule(Operator.MUL) {
        if (it.left is UnaryOperation && it.left.operator === Operator.SUB) {
            UnaryOperation(Operator.SUB, Operation(Operator.MUL, it.left.target, it.right))
        } else if (it.right is UnaryOperation && it.right.operator === Operator.SUB) {
            UnaryOperation(Operator.SUB, Operation(Operator.MUL, it.left, it.right.target))
        } else {
            it
        }
    }
)
