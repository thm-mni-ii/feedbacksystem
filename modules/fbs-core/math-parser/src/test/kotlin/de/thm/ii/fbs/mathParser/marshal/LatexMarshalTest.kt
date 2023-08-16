@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.mathParser.marshal

import de.thm.ii.fbs.mathParser.ast.*
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

class LatexMarshalTest {
    private val marshal = LatexMarshal()

    @Test
    fun simpleMarshal() {
        Assertions.assertEquals(
            "{1} + {2}",
            marshal.marshal(Ast(Operation(Operator.ADD, Num(1), Num(2))))
        )
    }

    @Test
    fun simpleDecimalMarshal() {
        Assertions.assertEquals(
            "{1{,}5} + {2}",
            marshal.marshal(Ast(Operation(Operator.ADD, Num(1.5), Num(2))))
        )
    }

    @Test
    fun simpleBigMarshal() {
        Assertions.assertEquals(
            "{122333444455555666666777777788888888999999998} + {1}",
            marshal.marshal(
                Ast(
                    Operation(
                        Operator.ADD,
                        Num("122333444455555666666777777788888888999999998"),
                        Num("1")
                    )
                )
            )
        )
    }

    @Test
    fun simpleUnaryMarshal() {
        Assertions.assertEquals(
            "-{a}",
            marshal.marshal(Ast(UnaryOperation(Operator.SUB, Var("a"))))
        )
    }

    @Test
    fun alphabetMarshal() {
        Assertions.assertEquals(
            "{a} \\cdot {{b} \\cdot {c}}",
            marshal.marshal(
                Ast(
                    Operation(
                        Operator.MUL,
                        Var("a"),
                        Operation(Operator.MUL, Var("b"), Var("c"))
                    )
                )
            )
        )
    }

    @Test
    fun countingMarshal() {
        Assertions.assertEquals(
            "{1} \\cdot {{2} \\cdot {3}}",
            marshal.marshal(
                Ast(
                    Operation(
                        Operator.MUL,
                        Var("1"),
                        Operation(Operator.MUL, Var("2"), Var("3"))
                    )
                )
            )
        )
    }

    @Test
    fun divisionMarshal() {
        Assertions.assertEquals(
            "\\frac{1}{2}",
            marshal.marshal(Ast(Operation(Operator.DIV, Num(1), Num(2))))
        )
    }

    @Test
    fun expMarshal() {
        Assertions.assertEquals(
            "{a} ^ {b}",
            marshal.marshal(Ast(Operation(Operator.EXP, Var("a"), Var("b"))))
        )
    }

    @Test
    fun rootMarshal() {
        Assertions.assertEquals(
            "\\sqrt[a]{b}",
            marshal.marshal(Ast(Operation(Operator.RAD, Var("a"), Var("b"))))
        )
    }

    @Test
    fun decimalMulMarshal() {
        Assertions.assertEquals(
            "{25{,}28} \\cdot {k}",
            marshal.marshal(Ast(Operation(Operator.MUL, Num(25.28), Var("k"))))
        )
    }

    @Test
    fun equationMarshal() {
        Assertions.assertEquals(
            "{a} = {b}",
            marshal.marshal(Ast(Operation(Operator.EQ, Var("a"), Var("b"))))
        )
    }

    @Test
    fun singleTypeBracketTestAdd() {
        Assertions.assertEquals(
            "{1} + {{2} + {{3} + {4}}}",
            marshal.marshal(
                Ast(
                    Operation(
                        Operator.ADD,
                        Num(1),
                        Operation(
                            Operator.ADD,
                            Num(2),
                            Operation(
                                Operator.ADD,
                                Num(3),
                                Num(4)
                            )
                        )
                    )
                )
            )
        )
    }

    @Test
    fun singleTypeBracketTestSub() {
        Assertions.assertEquals(
            "{1} - {{2} - {{3} - {4}}}",
            marshal.marshal(
                Ast(
                    Operation(
                        Operator.SUB,
                        Num(1),
                        Operation(
                            Operator.SUB,
                            Num(2),
                            Operation(
                                Operator.SUB,
                                Num(3),
                                Num(4)
                            )
                        )
                    )
                )
            )
        )
    }

    @Test
    fun singleTypeBracketTestExp() {
        Assertions.assertEquals(
            "{2} ^ {{2} ^ {{2} ^ {2}}}",
            marshal.marshal(
                Ast(
                    Operation(
                        Operator.EXP,
                        Num(2),
                        Operation(
                            Operator.EXP,
                            Num(2),
                            Operation(
                                Operator.EXP,
                                Num(2),
                                Num(2)
                            )
                        )
                    )
                )
            )
        )
    }

    @Test
    fun mixedTypeBracketTestExp() {
        Assertions.assertEquals(
            "({4} \\cdot {{a} ^ {2}}) ^ {3}",
            marshal.marshal(
                Ast(
                    Operation(
                        Operator.EXP,

                        Operation(
                            Operator.MUL,
                            Num(4),
                            Operation(Operator.EXP, Var("a"), Num(2))
                        ),
                        Num(3)
                    )
                )
            )
        )
    }

    @Test
    fun mixedTypeBracketTestAddSub() {
        Assertions.assertEquals(
            "{1} + {{2} - {{3} + {4}}}",
            marshal.marshal(
                Ast(
                    Operation(
                        Operator.ADD,
                        Num(1),
                        Operation(
                            Operator.SUB,
                            Num(2),
                            Operation(
                                Operator.ADD,
                                Num(3),
                                Num(4)
                            )
                        )
                    )
                )
            )
        )
    }

    @Test
    fun mixedTypeBracketTestAddMulNoBracket() {
        Assertions.assertEquals(
            "{1} + {{2} \\cdot {2}}",
            marshal.marshal(
                Ast(
                    Operation(
                        Operator.ADD,
                        Num(1),
                        Operation(
                            Operator.MUL,
                            Num(2),
                            Num(2)
                        )
                    )
                )
            )
        )
    }

    @Test
    fun mixedTypeBracketTestAddMulBracket() {
        Assertions.assertEquals(
            "({1} + {2}) \\cdot {2}",
            marshal.marshal(
                Ast(
                    Operation(
                        Operator.MUL,
                        Operation(
                            Operator.ADD,
                            Num(1),
                            Num(2)
                        ),
                        Num(2)
                    )
                )
            )
        )
    }
}
