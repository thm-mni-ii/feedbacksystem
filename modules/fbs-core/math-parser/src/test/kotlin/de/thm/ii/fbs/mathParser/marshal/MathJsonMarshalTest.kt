@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.mathParser.marshal

import de.thm.ii.fbs.mathParser.ast.*
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test

class MathJsonMarshalTest {
    private val marshal = MathJsonMarshal()

    @Test
    fun simpleMarshal() {
        Assertions.assertEquals(
            """["Add",1,2]""",
            marshal.marshal(Ast(Operation(Operator.ADD, Num(1), Num(2))))
        )
    }

    @Test
    fun simpleDecimalMarshal() {
        Assertions.assertEquals(
            """["Add",1.5,2]""",
            marshal.marshal(Ast(Operation(Operator.ADD, Num(1.5), Num(2))))
        )
    }

    @Test
    fun simpleBigMarshal() {
        Assertions.assertEquals(
            """["Add","122333444455555666666777777788888888999999998",1]""",
            marshal.marshal(Ast(Operation(Operator.ADD, Num("122333444455555666666777777788888888999999998"), Num("1"))))
        )
    }

    @Test
    fun simpleUnaryMarshal() {
        Assertions.assertEquals(
            """["Negate","a"]""",
            marshal.marshal(Ast(UnaryOperation(Operator.SUB, Var("a"))))
        )
    }

    @Test
    fun alphabetMarshal() {
        Assertions.assertEquals(
            """["Multiply","a",["Multiply","b","c"]]""",
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
    fun divisionMarshal() {
        Assertions.assertEquals(
            """["Divide",1,2]""",
            marshal.marshal(Ast(Operation(Operator.DIV, Num(1), Num(2))))
        )
    }

    @Test
    fun expMarshal() {
        Assertions.assertEquals(
            """["Power","a","b"]""",
            marshal.marshal(Ast(Operation(Operator.EXP, Var("a"), Var("b"))))
        )
    }

    @Test
    fun rootMarshal() {
        Assertions.assertEquals(
            """["Root","a","b"]""",
            marshal.marshal(Ast(Operation(Operator.RAD, Var("a"), Var("b"))))
        )
    }

    @Test
    fun decimalMulMarshal() {
        Assertions.assertEquals(
            """["Multiply","25.28","k"]""",
            marshal.marshal(Ast(Operation(Operator.MUL, Num(25.28), Var("k"))))
        )
    }
}
