@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.mathParser.transformers

import de.thm.ii.fbs.mathParser.ast.*
import de.thm.ii.fbs.mathParser.transformers.rules.OperandMatchingRule

class NeutralElementTransformer(config: TransformerConfig) : RuleBasedTransformer(
    OperandMatchingRule(Operator.ADD, config.exprFromInt(0)),
    OperandMatchingRule(Operator.MUL, config.exprFromInt(1)),
    OperandMatchingRule(Operator.SUB, config.exprFromInt(0), matchLeftOperand = false),
    OperandMatchingRule(Operator.DIV, config.exprFromInt(1), matchLeftOperand = false),
    OperandMatchingRule(Operator.EXP, config.exprFromInt(1), matchLeftOperand = false)
)
