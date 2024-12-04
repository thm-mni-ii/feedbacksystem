@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.mathParser

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.math.RoundingMode

internal class SemanticAstComparatorTest {
    private val semanticAstComparator = SemanticAstComparator.Builder()
        .decimals(2)
        .roundingMode(RoundingMode.HALF_UP)
        .ignoreNeutralElements(true)
        .applyInverseElements(true)
        .applyCommutativeLaw(true)
        .applyExponentLaws(true)
        .build()

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
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("a+b+c"),
                MathParserHelper.parse("c+b+a")
            )
        )
    }

    @Test
    fun compareThreeMull() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("abc"),
                MathParserHelper.parse("c*b*a")
            )
        )
    }

    @Test
    fun compareRealExp() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("1,23*10^3"),
                MathParserHelper.parse("10^3*1,23")
            )
        )
    }

    @Test
    fun compareRealComplex() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("2,1x+7,6x-19x-4,5x"),
                MathParserHelper.parse("x2,1-x*19+7,6x-4,5*x")
            )
        )
    }

    @Test
    fun subSwapTest() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("a-b+c"),
                MathParserHelper.parse("a+c-b")
            )
        )
    }

    @Test
    fun divisionAsFrac() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("(6a+8b)/x"),
                MathParserHelper.parse("1/x*(6a+8b)")
            )
        )
    }

    @Test
    fun divisionAsFracWithExp() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("(6a+8b)/x"),
                MathParserHelper.parse("(6a+8b)*x^(-1)")
            )
        )
    }

    @Test
    fun multiplicationWithBracketsTest() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("5*(x-1)"),
                MathParserHelper.parse("5(x-1)")
            )
        )
    }

    @Test
    fun multiplicationWithExponentTest() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("4a^(-4)b^4"),
                MathParserHelper.parse("4*a^(-4)*b^4")
            )
        )
    }

    @Test
    fun multiplicationWithNegativesTest() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("4a-3b"),
                MathParserHelper.parse("4a+(-3b)")
            )
        )
    }

    @Test
    fun equationTest() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("a^2 + b^2 = c^2"),
                MathParserHelper.parse("c^2 = a^2 + b^2")
            )
        )
    }

    @Test
    fun fracEquationTest() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("x=-(1/24)"),
                MathParserHelper.parse("x=-\\frac{1}{24}")
            )
        )
    }

    @Test
    fun constructionTest() {
        assertNotNull(SemanticAstComparator(2, RoundingMode.HALF_UP, ignoreNeutralElements = false, applyInverseElements = false, applyCommutativeLaw = false))
        assertNotNull(SemanticAstComparator())
    }

    @Test
    fun differentExponentRepresentationTest() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("a^2"),
                MathParserHelper.parse("a²")
            )
        )
    }

    @Test
    fun multiCharacterDifferentExponentRepresentationTest() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("a^{22}"),
                MathParserHelper.parse("a²²")
            )
        )
    }

    @Test
    fun complexDifferentExponentRepresentationTest() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("2^3^4"),
                MathParserHelper.parse("(2³)⁴")
            )
        )
    }

    @Test
    fun emptyExponentTest() {
        assertTrue(
            semanticAstComparator.compare(
                MathParserHelper.parse("a^{}"),
                MathParserHelper.parse("a")
            )
        )
    }
}
