package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.*
import org.junit.jupiter.api.Test

import org.junit.jupiter.api.Assertions.*

internal class MathParserHelperTest {

    @Test
    fun parseSimpleAdd() {
        assertEquals(
            Ast(
                Operation(Operator.ADD, Num(1), Num(1))
            ),
            MathParserHelper.parse("1+1")
        )
    }

    @Test
    fun parseSimpleSub() {
        assertEquals(
            Ast(
                Operation(Operator.SUB, Num(1), Num(1))
            ),
            MathParserHelper.parse("1-1")
        )
    }

    @Test
    fun parseSimpleMul() {
        assertEquals(
            Ast(
                Operation(Operator.MUL, Num(1), Num(1))
            ),
            MathParserHelper.parse("1*1")
        )
    }

    @Test
    fun parseSimpleDiv() {
        assertEquals(
            Ast(
                Operation(Operator.DIV, Num(1), Num(1))
            ),
            MathParserHelper.parse("1/1")
        )
    }

    @Test
    fun parseSimpleWithSpaces() {
        assertEquals(
            Ast(
                Operation(Operator.ADD, Num(1), Num(1))
            ),
            MathParserHelper.parse("1 + 1")
        )
    }


    @Test
    fun parseSimpleExp() {
        assertEquals(
            Ast(
                Operation(Operator.EXP, Num(1), Num(1))
            ),
            MathParserHelper.parse("1^1")
        )
    }

    @Test
    fun parseSimpleSqrt() {
        assertEquals(
            Ast(
                Operation(Operator.RAD, Num(2), Num(2))
            ),
            MathParserHelper.parse("sqrt 2")
        )
    }

    @Test
    fun parseBracketSqrt() {
        assertEquals(
            Ast(
                Operation(Operator.RAD, Num(2), Operation(Operator.ADD, Num(2), Num(2)))
            ),
            MathParserHelper.parse("sqrt (2+2)")
        )
    }

    @Test
    fun parseNoBracketSqrt() {
        assertEquals(
            Ast(
                Operation(Operator.ADD,
                    Operation(Operator.RAD, Num(2), Num(2)),
                    Num(2)
                )
            ),
            MathParserHelper.parse("sqrt 2+2")
        )
    }

    @Test
    fun parseSimpleLb() {
        assertEquals(
            Ast(
                Operation(Operator.LOG, Num(2), Num(2))
            ),
            MathParserHelper.parse("lb 2")
        )
    }

    @Test
    fun parseSimpleLn() {
        assertEquals(
            Ast(
                Operation(Operator.LOG, Num(Math.E), Num(2))
            ),
            MathParserHelper.parse("ln 2")
        )
    }

    @Test
    fun parseSimpleLg() {
        assertEquals(
            Ast(
                Operation(Operator.LOG, Num(10), Num(2))
            ),
            MathParserHelper.parse("lg 2")
        )
    }

    @Test
    fun parseSimpleRad() {
        assertEquals(
            Ast(
                Operation(Operator.RAD, Num(10), Num(20))
            ),
            MathParserHelper.parse("rad 10 20")
        )
    }

    @Test
    fun parseSimpleLog() {
        assertEquals(
            Ast(
                Operation(Operator.LOG, Num(5), Num(15))
            ),
            MathParserHelper.parse("log 5 15")
        )
    }

    @Test
    fun parseAddRad() {
        assertEquals(
            Ast(
                Operation(Operator.RAD, Operation(Operator.ADD, Num(5), Num(5)), Num(20))
            ),
            MathParserHelper.parse("rad 5+5 20")
        )
    }

    @Test
    fun parseRadAdd() {
        assertEquals(
            Ast(
                Operation(Operator.ADD, Operation(Operator.RAD, Num(5), Num(10)), Num(10))
            ),
            MathParserHelper.parse("rad 5 10+10")
        )
    }

    @Test
    fun parseBracketRadAdd() {
        assertEquals(
            Ast(
                Operation(Operator.RAD, Num(5), Operation(Operator.ADD, Num(10), Num(10)))
            ),
            MathParserHelper.parse("rad 5 (10+10)")
        )
    }

    @Test
    fun parseComplexWithoutBraces() {
        assertEquals(
            Ast(
                Operation(Operator.ADD,
                    Operation(Operator.ADD, Num(1), Operation(Operator.MUL, Num(5), Num(3))),
                    Operation(Operator.DIV, Num(8), Num(10))
                )
            ),
            MathParserHelper.parse("1 + 5 * 3 + 8 / 10")
        )
    }

    @Test
    fun parseComplexWithBraces() {
        assertEquals(
            Ast(
                Operation(Operator.ADD,
                    Operation(Operator.ADD, Num(1), Operation(Operator.MUL, Num(5), Num(3))),
                    Operation(Operator.DIV, Num(8), Num(10))
                )
            ),
            MathParserHelper.parse("1 + (5 * 3) + (8 / 10)")
        )
    }

    @Test
    fun parseComplexWithOtherBraces() {
        assertEquals(
            Ast(
                Operation(Operator.DIV,
                    Operation(Operator.MUL,
                        Operation(Operator.ADD, Num(1), Num(5)),
                        Operation(Operator.ADD, Num(3), Num(8))
                    ),
                    Num(10)
                )
            ),
            MathParserHelper.parse("((1 + 5) * (3 + 8)) / 10")
        )
    }

    @Test
    fun parseVariables() {
        assertEquals(
            Ast(
                Operation(Operator.ADD, Var("a"), Var("b"))
            ),
            MathParserHelper.parse("a+b")
        )
    }

    @Test
    fun parseVariablesExplicitMul() {
        assertEquals(
            Ast(
                Operation(Operator.MUL, Var("a"), Var("b"))
            ),
            MathParserHelper.parse("a*b")
        )
    }

    @Test
    fun parseVariablesImplicitMul() {
        assertEquals(
            Ast(
                Operation(Operator.MUL, Var("a"), Var("b"))
            ),
            MathParserHelper.parse("ab")
        )
    }

    @Test
    fun parseMixed() {
        assertEquals(
            Ast(
                Operation(Operator.ADD,
                    Operation(Operator.ADD,
                        Operation(Operator.MUL, Num(1), Var("a")),
                        Operation(Operator.MUL, Num(2), Var("b")),
                    ),
                    Operation(Operator.MUL, Num(3), Var("c")),
                )
            ),
            MathParserHelper.parse("1a+2*b+3c")
        )
    }

    @Test
    fun parseInvalid() {
        assertThrows(MathParserException::class.java) { MathParserHelper.parse("1+") }
    }

    @Test
    fun parseInvalidText() {
        assertThrows(MathParserException::class.java) { MathParserHelper.parse("\$foo") }
    }
}
