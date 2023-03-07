package de.thm.ii.fbs.mathParser.transformers

import de.thm.ii.fbs.mathParser.ast.Operation
import de.thm.ii.fbs.mathParser.ast.Operator
import de.thm.ii.fbs.mathParser.transformers.rules.OperatorMatchingRule

class DivisionReplacingTransformer(config: TransformerConfig) : RuleBasedTransformer(
    OperatorMatchingRule(Operator.DIV) { Operation(Operator.MUL, it.left, Operation(Operator.DIV, config.exprFromInt(1), it.right)) },
)
