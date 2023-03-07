package de.thm.ii.fbs.mathParser.transformers.rules

import de.thm.ii.fbs.mathParser.ast.Num
import de.thm.ii.fbs.mathParser.ast.Operation
import de.thm.ii.fbs.mathParser.ast.Operator
import org.junit.jupiter.api.Test

import org.junit.jupiter.api.Assertions.*

internal class OperandMatchingRuleTest {
    private val rule = OperandMatchingRule(Operator.ADD, Num(0))
    private val matchingExpression = Operation(Operator.ADD, Num(4), Num(0))
    private val nonMatchingExpression = Operation(Operator.ADD, Num(4), Num(4))

    @Test
    fun matchesOperation() {
        assertEquals(true, rule.matchesOperation(matchingExpression))
    }

    @Test
    fun notMatchesOperation() {
        assertEquals(false, rule.matchesOperation(nonMatchingExpression))
    }

    @Test
    fun applyOperation() {
        assertEquals(Num(4), rule.applyOperation(matchingExpression))
    }

    @Test
    fun nonApplyOperation() {
        assertThrows(IllegalArgumentException::class.java) {rule.applyOperation(nonMatchingExpression)}
    }
}
