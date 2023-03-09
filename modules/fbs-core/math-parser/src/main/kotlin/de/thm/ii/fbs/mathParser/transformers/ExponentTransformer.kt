package de.thm.ii.fbs.mathParser.transformers

import de.thm.ii.fbs.mathParser.ast.Num
import de.thm.ii.fbs.mathParser.ast.Operation
import de.thm.ii.fbs.mathParser.ast.Operator
import de.thm.ii.fbs.mathParser.ast.UnaryOperation
import de.thm.ii.fbs.mathParser.transformers.rules.OperandMatchingRule
import de.thm.ii.fbs.mathParser.transformers.rules.OperatorMatchingRule

class ExponentTransformer(config: TransformerConfig) : RuleBasedTransformer(
    OperatorMatchingRule(Operator.EXP) {
        if (it.right is UnaryOperation && it.right.operator == Operator.SUB)
            Operation(
                Operator.DIV,
                config.exprFromInt(1),
                Operation(Operator.EXP, it.left, it.right.target)
            )
        else it
    },
)
