package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.*
import java.text.NumberFormat
import java.util.*
import kotlin.math.exp

class AstBuilder(val expr: MathParser.ExprContext) {
    var ast: Ast? = null

    fun build(): Ast {
        if (ast != null) {
            return ast as Ast
        }

        ast = Ast(buildExpr(expr))

        return ast as Ast
    }

    private fun buildExpr(expr: MathParser.ExprContext): Expr =
        when {
            expr.NUMBER() !== null -> buildNumber(expr)
            expr.VAR() !== null -> buildVariable(expr)
            expr.SQR() !== null -> buildDefaultOperation(expr, Operator.RAD, 2)
            expr.LB() !== null ->  buildDefaultOperation(expr, Operator.LOG, 2)
            expr.LN() !== null ->  buildDefaultOperation(expr, Operator.LOG, Math.E)
            expr.LG() !== null ->  buildDefaultOperation(expr, Operator.LOG, 10)
            expr.expr().size == 1 -> buildExpr(expr.expr(0))
            else -> buildOperation(expr)
        }

    private fun buildOperation(expr: MathParser.ExprContext): Expr =
            Operation(extractOperator(expr), buildExpr(expr.expr(0)), buildExpr(expr.expr(1)))

    private fun buildDefaultOperation(expr: MathParser.ExprContext, operator: Operator, default: Number) =
        Operation(operator, Num(default), buildExpr(expr.expr(0)))

    private fun extractOperator(expr: MathParser.ExprContext): Operator =
        when {
            expr.ADD() !== null -> Operator.ADD
            expr.SUB() !== null -> Operator.SUB
            expr.mul() !== null -> Operator.MUL
            expr.DIV() !== null -> Operator.DIV
            expr.EXP() !== null -> Operator.EXP
            expr.RAD() !== null -> Operator.RAD
            expr.LOG() !== null -> Operator.LOG
            else -> throw IllegalArgumentException("no operator found")
        }

    private fun buildNumber(expr: MathParser.ExprContext) =
        Num(germanFormat.parse(expr.NUMBER().text))

    private fun buildVariable(expr: MathParser.ExprContext): Expr =
        Var(expr.VAR().text)

    private val germanFormat = NumberFormat.getNumberInstance(Locale.GERMAN)
    init {
        germanFormat.maximumFractionDigits = germanFormat.maximumIntegerDigits
    }
}
