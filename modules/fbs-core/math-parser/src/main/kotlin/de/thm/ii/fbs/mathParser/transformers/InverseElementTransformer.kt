package de.thm.ii.fbs.mathParser.transformers

import de.thm.ii.fbs.mathParser.ast.Operator
import de.thm.ii.fbs.mathParser.ast.UnaryOperation
import de.thm.ii.fbs.mathParser.transformers.rules.OperandMatchingRule

class InverseElementTransformer(config: TransformerConfig) : RuleBasedTransformer(
    OperandMatchingRule(Operator.MUL, config.exprFromInt(-1)) { UnaryOperation(Operator.SUB, it) },
    OperandMatchingRule(Operator.SUB, config.exprFromInt(0), matchRightOperand = false) { UnaryOperation(Operator.SUB, it) }
)
