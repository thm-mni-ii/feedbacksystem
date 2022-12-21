package de.thm.ii.fbs.mathParser

import org.junit.jupiter.api.Test

import org.junit.jupiter.api.Assertions.*

internal class SemanticAstComparerTest {
    @Test
    fun compareSimple() {
        assertTrue(
            SemanticAstComparer(
                MathParserHelper.parse("1+2")
            ).compare(MathParserHelper.parse("2+1"))
        )
    }

    @Test
    fun compareMulti() {
        assertTrue(
            SemanticAstComparer(
                MathParserHelper.parse("1a+2b")
            ).compare(MathParserHelper.parse("b2+a1"))
        )
    }

    @Test
    fun compareOneMul() {
        assertTrue(
            SemanticAstComparer(
                MathParserHelper.parse("1a+2b")
            ).compare(MathParserHelper.parse("a+2b"))
        )
    }

    @Test
    fun compareNotEqual() {
        assertFalse(
            SemanticAstComparer(
                MathParserHelper.parse("1a+2b")
            ).compare(MathParserHelper.parse("2a+1b"))
        )
    }

    @Test
    fun compareNotEqualVars() {
        assertFalse(
            SemanticAstComparer(
                MathParserHelper.parse("1a+2b")
            ).compare(MathParserHelper.parse("1b+2a"))
        )
    }
}
