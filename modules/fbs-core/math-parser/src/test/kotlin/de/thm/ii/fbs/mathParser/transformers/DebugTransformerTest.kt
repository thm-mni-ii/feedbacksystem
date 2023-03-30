package de.thm.ii.fbs.mathParser.transformers

import de.thm.ii.fbs.mathParser.ast.*
import org.junit.jupiter.api.Test

import org.junit.jupiter.api.Assertions.*

internal class DebugTransformerTest {
    private val simpleAst = Ast(Operation(Operator.ADD, Num(1), Num(1)))

    @Test
    fun transform() {
        assertEquals(simpleAst, DebugTransformer().transform(simpleAst))
    }
}
