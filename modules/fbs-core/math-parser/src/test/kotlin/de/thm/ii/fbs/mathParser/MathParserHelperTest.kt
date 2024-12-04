@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

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
            MathParserHelper.parse("\\sqrt{2}{2}")
        )
    }

    @Test
    fun parseBracketSqrt() {
        assertEquals(
            Ast(
                Operation(Operator.RAD, Num(2), Operation(Operator.ADD, Num(2), Num(2)))
            ),
            MathParserHelper.parse("\\sqrt[2]{2+2}")
        )
    }

    @Test
    fun parseNoBracketSqrt() {
        assertEquals(
            Ast(
                Operation(Operator.RAD, Num(2), Operation(Operator.ADD, Num(2), Num(2)))
            ),
            MathParserHelper.parse("\\sqrt{2+2}")
        )
    }

    @Test
    fun parseSimpleLb() {
        assertEquals(
            Ast(
                Operation(Operator.LOG, Num(2), Num(2))
            ),
            MathParserHelper.parse("\\lb{2}")
        )
    }

    @Test
    fun parseSimpleLd() {
        assertEquals(
            Ast(
                Operation(Operator.LOG, Num(2), Num(4))
            ),
            MathParserHelper.parse("\\ld{4}")
        )
    }

    @Test
    fun parseSimpleLn() {
        assertEquals(
            Ast(
                Operation(Operator.LOG, Num(Math.E), Num(2))
            ),
            MathParserHelper.parse("\\ln{2}")
        )
    }

    @Test
    fun parseSimpleLg() {
        assertEquals(
            Ast(
                Operation(Operator.LOG, Num(10), Num(2))
            ),
            MathParserHelper.parse("\\lg{2}")
        )
    }

    @Test
    fun parseSimpleRad() {
        assertEquals(
            Ast(
                Operation(Operator.RAD, Num(10), Num(20))
            ),
            MathParserHelper.parse("\\rad{10}{20}")
        )
    }

    @Test
    fun parseSimpleLog() {
        assertEquals(
            Ast(
                Operation(Operator.LOG, Num(5), Num(15))
            ),
            MathParserHelper.parse("\\log{5}{15}")
        )
    }

    @Test
    fun parseAddRad() {
        assertEquals(
            Ast(
                Operation(Operator.RAD, Operation(Operator.ADD, Num(5), Num(5)), Num(20))
            ),
            MathParserHelper.parse("\\rad{5+5}{20}")
        )
    }

    @Test
    fun parseRadAdd() {
        assertEquals(
            Ast(
                Operation(Operator.ADD, Operation(Operator.RAD, Num(5), Num(10)), Num(10))
            ),
            MathParserHelper.parse("\\rad{5}{10}+10")
        )
    }

    @Test
    fun parseBracketRadAdd() {
        assertEquals(
            Ast(
                Operation(Operator.RAD, Num(5), Operation(Operator.ADD, Num(10), Num(10)))
            ),
            MathParserHelper.parse("\\rad{5}{10+10}")
        )
    }

    @Test
    fun parseSimpleUnaryMinus() {
        assertEquals(
            Ast(
                UnaryOperation(Operator.SUB, Num(5))
            ),
            MathParserHelper.parse("-5")
        )
    }

    @Test
    fun parseWithMultiplicationUnaryMinus() {
        assertEquals(
            Ast(
                UnaryOperation(Operator.SUB, Operation(Operator.EXP, Num(5), Num(2)))
            ),
            MathParserHelper.parse("-5^2")
        )
    }

    @Test
    fun parseComplexWithoutBraces() {
        assertEquals(
            Ast(
                Operation(
                    Operator.ADD,
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
                Operation(
                    Operator.ADD,
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
                Operation(
                    Operator.DIV,
                    Operation(
                        Operator.MUL,
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
    fun parseComplexWithLeftRightBraces() {
        assertEquals(
            Ast(
                Operation(
                    Operator.MUL,
                    Operation(
                        Operator.MUL,
                        Num(7),
                        Var("a")
                    ),
                    Operation(
                        Operator.SUB,
                        Num(2),
                        Operation(Operator.MUL, Num(3), Var("b"))
                    )
                )
            ),
            MathParserHelper.parse("7a\\left(2-3b\\right)")
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
    fun parseEquation() {
        assertEquals(
            Ast(
                Operation(
                    Operator.EQ,
                    Operation(
                        Operator.ADD,
                        Operation(Operator.EXP, Var("a"), Num(2)),
                        Operation(Operator.EXP, Var("b"), Num(2))
                    ),
                    Operation(Operator.EXP, Var("c"), Num(2))
                )
            ),
            MathParserHelper.parse("a^2 + b^2 = c^2")
        )
    }

    @Test
    fun parseMixed() {
        assertEquals(
            Ast(
                Operation(
                    Operator.ADD,
                    Operation(
                        Operator.ADD,
                        Operation(Operator.MUL, Num(1), Var("a")),
                        Operation(Operator.MUL, Num(2), Var("b"))
                    ),
                    Operation(Operator.MUL, Num(3), Var("c"))
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

    @Test
    fun parseInvalidEmpty() {
        assertThrows(MathParserException::class.java) { MathParserHelper.parse("") }
    }

    @Test
    fun parseToDot() {
        assertEquals(
            """
            strict graph {
            rankdir=BT
            1 [label=1]
            2 [label=5]
            3 [label=ADD]
            1 -- 3 [label=l]
            2 -- 3 [label=r]
            4 [label=3]
            5 [label=8]
            6 [label=a]
            7 [label=MUL]
            5 -- 7 [label=l]
            6 -- 7 [label=r]
            8 [label=ADD]
            4 -- 8 [label=l]
            7 -- 8 [label=r]
            9 [label=MUL]
            3 -- 9 [label=l]
            8 -- 9 [label=r]
            10 [label=SUB]
            9 -- 10
            11 [label=10]
            12 [label=DIV]
            10 -- 12 [label=l]
            11 -- 12 [label=r]
            }
            """.trimIndent(),
            MathParserHelper.parse("-((1 + 5) * (3 + 8a)) / 10").toDot()
        )
    }

    @Test
    fun parseLongDecimal() {
        assertEquals(
            Ast(
                Num(1.23456789)
            ),
            MathParserHelper.parse("1,23456789")
        )
    }

    @Test
    fun fromJson() {
        assertEquals(
            Ast(
                Operation(Operator.ADD, Num(1), Num(2))
            ),
            MathParserHelper.fromMathJson("""["Add",1,2]""")
        )
    }

    @Test
    fun toJson() {
        assertEquals(
            """["Add",1,2]""",
            MathParserHelper.toMathJson(
                Ast(
                    Operation(Operator.ADD, Num(1), Num(2))
                )
            )
        )
    }

    @Test
    fun toLatex() {
        assertEquals(
            "{1} + {2}",
            MathParserHelper.toLatex(
                Ast(
                    Operation(Operator.ADD, Num(1), Num(2))
                )
            )
        )
    }

    @Test
    fun parseLatexMul() {
        assertEquals(
            Ast(
                Operation(Operator.MUL, Num(1), Num(1))
            ),
            MathParserHelper.parse("1\\cdot1")
        )
    }

    @Test
    fun parseLatexFrac() {
        assertEquals(
            Ast(
                Operation(Operator.DIV, Num(1), Num(1))
            ),
            MathParserHelper.parse("\\frac{1}{1}")
        )
    }

    @Test
    fun parseLatexExp() {
        assertEquals(
            Ast(
                Operation(Operator.EXP, Num(2), Operation(Operator.ADD, Num(1), Num(1)))
            ),
            MathParserHelper.parse("2^{1+1}")
        )
    }

    @Test
    fun parseEmptyExp() {
        assertEquals(
            Ast(
                Operation(Operator.ADD, Operation(Operator.EXP, Num(2), Num(1)), Operation(Operator.EXP, Num(2), Num(1)))
            ),
            MathParserHelper.parse("2^{}+2^{}")
        )
    }

    @Test
    fun parseLatexRad() {
        assertEquals(
            Ast(
                Operation(Operator.RAD, Num(4), Num(2))
            ),
            MathParserHelper.parse("\\sqrt[4]{2}")
        )
    }

    @Test
    fun multiplicationWithExplicitTest() {
        assertEquals(
            Ast(
                Operation(
                    Operator.MUL,
                    Operation(
                        Operator.MUL,
                        Num(4),
                        Operation(
                            Operator.EXP,
                            Var("a"),
                            UnaryOperation(Operator.SUB, Num(4))
                        )
                    ),
                    Operation(Operator.EXP, Var("b"), Num(4))
                )
            ),
            MathParserHelper.parse("4*a^(-4)*b^4")
        )
    }

    @Test
    fun multiplicationWithExponentImplicitTest() {
        print(MathParserHelper.parse("4a^(-4)b^4").toDot())
        assertEquals(
            Ast(
                Operation(
                    Operator.MUL,
                    Operation(
                        Operator.MUL,
                        Num(4),
                        Operation(
                            Operator.EXP,
                            Var("a"),
                            UnaryOperation(Operator.SUB, Num(4))
                        )
                    ),
                    Operation(Operator.EXP, Var("b"), Num(4))
                )
            ),
            MathParserHelper.parse("4a^(-4)b^4")
        )
    }

    @Test
    fun multiplicationExponentTest() {
        val expected = Ast(
            Operation(
                Operator.MUL,
                Operation(
                    Operator.EXP,
                    Num(5),
                    Num(4)
                ),
                Var("a")
            )
        )
        assertEquals(expected, MathParserHelper.parse("5^4a"))
        assertEquals(expected, MathParserHelper.parse("5^4*a"))
    }

    @Test
    fun negativeExponentTest() {
        val expected = Ast(
            Operation(
                Operator.EXP,
                Var("x"),
                UnaryOperation(
                    Operator.SUB,
                    Num(3)
                )
            )
        )
        assertEquals(expected, MathParserHelper.parse("x^(-3)"))
        assertEquals(expected, MathParserHelper.parse("x^-3"))
    }

    @Test
    fun exponentOfExponentTest() {
        val expected = Ast(
            Operation(
                Operator.EXP,
                Operation(
                    Operator.EXP,
                    Num(2),
                    Num(3)
                ),
                Num(4)
            )
        )
        assertEquals(expected, MathParserHelper.parse("(2^3)^4"))
        assertEquals(expected, MathParserHelper.parse("2^3^4"))
    }

    @Test
    fun simpleUnicodeExponentTest() {
        val expected = Ast(
            Operation(
                Operator.EXP,
                Num(2),
                Num(2)
            )
        )
        assertEquals(expected, MathParserHelper.parse("2²"))
    }

    @Test
    fun multiCharacterUnicodeExponentTest() {
        val expected = Ast(
            Operation(
                Operator.EXP,
                Num(2),
                Num(16)
            )
        )
        assertEquals(expected, MathParserHelper.parse("2¹⁶"))
    }

    @Test
    fun complexUnicodeExponentTest() {
        val expected = Ast(
            Operation(
                Operator.EXP,
                Operation(
                    Operator.EXP,
                    Num(2),
                    Num(3)
                ),
                Num(4)
            )
        )
        assertEquals(expected, MathParserHelper.parse("(2³)⁴"))
    }
}
