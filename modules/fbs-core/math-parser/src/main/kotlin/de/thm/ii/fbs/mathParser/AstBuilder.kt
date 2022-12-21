package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.*
import java.text.NumberFormat
import java.util.*

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
        if (expr.NUMBER() !== null) {
            buildNumber(expr)
        } else if (expr.SQR() != null) {
            Operation(Operator.RAD, Num(2), buildExpr(expr.expr(0)))
        } else if (expr.LB() != null) {
            Operation(Operator.LOG, Num(2), buildExpr(expr.expr(0)))
        } else if (expr.LN() != null) {
            Operation(Operator.LOG, Num(Math.E), buildExpr(expr.expr(0)))
        } else if (expr.LG() != null) {
            Operation(Operator.LOG, Num(10), buildExpr(expr.expr(0)))
        } else if (expr.expr().size == 1) {
            buildExpr(expr.expr(0))
        } else {
            buildOperation(expr)
        }

    private fun buildOperation(expr: MathParser.ExprContext): Expr =
            Operation(extractOperator(expr), buildExpr(expr.expr(0)), buildExpr(expr.expr(1)))

    private fun extractOperator(expr: MathParser.ExprContext): Operator =
            if (expr.ADD() !== null) Operator.ADD
            else if (expr.SUB() !== null) Operator.SUB
            else if (expr.MUL() !== null) Operator.MUL
            else if (expr.DIV() !== null) Operator.DIV
            else if (expr.EXP() !== null) Operator.EXP
            else if (expr.RAD() !== null) Operator.RAD
            else if (expr.LOG() !== null) Operator.LOG
            else throw IllegalArgumentException("no operator found")

    private fun buildNumber(expr: MathParser.ExprContext) =
        Num(germanFormat.parse(expr.NUMBER().text))

    private val germanFormat = NumberFormat.getNumberInstance(Locale.GERMAN)
    init {
        germanFormat.maximumFractionDigits = germanFormat.maximumIntegerDigits
    }
}
