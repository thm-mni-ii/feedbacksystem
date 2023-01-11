package de.thm.ii.fbs.mathParser

import org.junit.jupiter.api.Test

import org.junit.jupiter.api.Assertions.*

internal class SemanticAstComparatorTest {
    private val semanticAstComparator = SemanticAstComparator(2)
    
    @Test
    fun compareSimple() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("1+2"),
                MathParserHelper.parse("2+1")
            )
        )
    }

    @Test
    fun compareMulti() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("1a+2b"),
                MathParserHelper.parse("b2+a1")
            )
        )
    }

    @Test
    fun compareOneMul() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("1a+2b"),
                MathParserHelper.parse("a+2b")
            )
        )
    }

    @Test
    fun compareNotEqual() {
        assertFalse(
            semanticAstComparator.compare(
                MathParserHelper.parse("1a+2b"),
                MathParserHelper.parse("2a+1b")
            )
        )
    }

    @Test
    fun compareNotEqualVars() {
        assertFalse(
            semanticAstComparator.compare(
                MathParserHelper.parse("1a+2b"),
                MathParserHelper.parse("1b+2a")
            )
        )
    }

    @Test
    fun compareThree() {
        assertFalse(
            semanticAstComparator.compare(
                MathParserHelper.parse("a+b+c"),
                MathParserHelper.parse("c+b+a")
            )
        )
    }
}
