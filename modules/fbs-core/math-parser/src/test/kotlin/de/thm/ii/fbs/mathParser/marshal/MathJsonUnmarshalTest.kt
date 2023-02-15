package de.thm.ii.fbs.mathParser.marshal

import de.thm.ii.fbs.mathParser.ast.*
import org.junit.jupiter.api.Test

import org.junit.jupiter.api.Assertions.*

internal class MathJsonUnmarshalTest {
    private val marshal = MathJsonMarshal()

    @Test
    fun simpleUnmarshal() {
        assertEquals(
            Ast(Operation(Operator.ADD, Num(1), Num(2))),
            marshal.unmarshal("""["Add",1,2]""")
        )
    }

    @Test
    fun mixedUnmarshal() {
        assertEquals(
            Ast(
                Operation(
                    Operator.SUB,
                    Operation(Operator.MUL, Num(2), Var("b")),
                    Var("a")
                )
            ),
            marshal.unmarshal("""["Subtract",["Multiply",2,"b"],"a"]""")
        )
    }

    @Test
    fun alphabetUnmarshal() {
        assertEquals(
            Ast(
                Operation(
                    Operator.MUL,
                    Var("a"),
                    Operation(Operator.MUL, Var("b"), Var("c"))
                )
            ),
            marshal.unmarshal("""["Multiply","a","b","c"]""")
        )
    }

    @Test
    fun divisionUnmarshal() {
        assertEquals(
            Ast(Operation(Operator.DIV, Num(1), Num(2))),
            marshal.unmarshal("""["Rational",1,2]""")
        )
    }

    @Test
    fun expUnmarshal() {
        assertEquals(
            Ast(Operation(Operator.EXP, Var("a"), Var("b"))),
            marshal.unmarshal("""["Power","a","b"]""")
        )
    }

    @Test
    fun rootUnmarshal() {
        assertEquals(
            Ast(
                Operation(
                    Operator.EXP,
                    Var("a"),
                    Operation(Operator.DIV, Num(1), Var("b"))
                )
            ),
            marshal.unmarshal("""["Power","a",["Divide",1,"b"]]""")
        )
    }

    @Test
    fun squareUnmarshal() {
        assertEquals(
            Ast(Operation(Operator.EXP, Num(4), Num(2))),
            marshal.unmarshal("""["Square",4]""")
        )
    }

    @Test
    fun sqrtUnmarshal() {
        assertEquals(
            Ast(Operation(Operator.RAD, Num(4), Num(2))),
            marshal.unmarshal("""["Sqrt",4]""")
        )
    }

    @Test
    fun objectNotationUnmarshal() {
        assertEquals(
            Ast(Operation(Operator.ADD, Num(1), Var("x"))),
            marshal.unmarshal("""{"fn": [{"sym": "Add"}, {"num": "1"}, {"sym": "x"}]}""")
        )
    }
}
