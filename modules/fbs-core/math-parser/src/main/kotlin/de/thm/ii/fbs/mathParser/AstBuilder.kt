package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.*
import java.text.NumberFormat
import java.util.*

class AstBuilder(val expr: MathParser.ExprContext) {
    fun build(): Ast =
        Ast(buildExpr(expr))

    private fun buildExpr(expr: MathParser.ExprContext): Expr =
        when {
            expr.ADD() !== null -> Operation(Operator.ADD, buildExpr(expr.expr(0)), buildTerm(expr.term()))
            expr.SUB() !== null -> Operation(Operator.SUB, buildExpr(expr.expr(0)), buildTerm(expr.term()))
            expr.RAD() !== null -> Operation(Operator.RAD, buildExpr(expr.expr(0)), buildExpr(expr.expr(1)))
            expr.LOG() !== null -> Operation(Operator.LOG, buildExpr(expr.expr(0)), buildExpr(expr.expr(1)))
            expr.term() !== null -> buildTerm(expr.term())
            else -> throw IllegalArgumentException("not a legal expression: ${expr.text}")
        }

    private fun buildTerm(term: MathParser.TermContext): Expr =
        when {
            term.MUL() !== null -> Operation(Operator.MUL, buildTerm(term.term()), buildExpo(term.expo()))
            term.DIV() !== null -> Operation(Operator.DIV, buildTerm(term.term()), buildExpo(term.expo()))
            term.MOD() !== null -> Operation(Operator.MOD, buildTerm(term.term()), buildExpo(term.expo()))
            term.expo() !== null -> buildExpo(term.expo())
            else -> throw IllegalArgumentException("not a legal term: ${term.text}")
        }

    private fun buildExpo(expo: MathParser.ExpoContext): Expr =
        when {
            expo.EXP() !== null -> Operation(Operator.EXP, buildExpo(expo.expo()), buildFunct(expo.funct()))
            expo.funct() !== null -> buildFunct(expo.funct())
            else -> throw IllegalArgumentException("not a legal exponential: ${expo.text}")
        }

    private fun buildFunct(funct: MathParser.FunctContext): Expr =
        when {
            funct.SQR() !== null -> Operation(Operator.RAD, Num(2), buildFunct(funct.funct()))
            funct.LB() !== null -> Operation(Operator.LOG, Num(2), buildFunct(funct.funct()))
            funct.LN() !== null -> Operation(Operator.LOG, Num(Math.E), buildFunct(funct.funct()))
            funct.LG() !== null -> Operation(Operator.LOG, Num(10), buildFunct(funct.funct()))
            funct.unary() !== null -> buildUnary(funct.unary())
            else -> throw IllegalArgumentException("not a legal function: ${funct.text}")
        }

    private fun buildUnary(unary: MathParser.UnaryContext): Expr =
        when {
            unary.mulFactor() !== null -> if (unary.SUB() !== null) UnaryOperation(Operator.SUB, buildMulFactor(unary.mulFactor())) else buildMulFactor(unary.mulFactor())
            else -> throw IllegalArgumentException("not a legal unary: ${unary.text}")
        }


    private fun buildMulFactor(mulFactor: MathParser.MulFactorContext): Expr =
        when {
            mulFactor.mulFactor() !== null -> Operation(Operator.MUL, buildMulFactor(mulFactor.mulFactor()), buildFactor(mulFactor.factor()))
            mulFactor.factor() !== null -> buildFactor(mulFactor.factor())
            else -> throw IllegalArgumentException("not a legal mulFactor: ${mulFactor.text}")
        }

    private fun buildFactor(factor: MathParser.FactorContext): Expr =
        when {
            factor.expr() !== null -> buildExpr(factor.expr())
            factor.NUMBER() !== null -> Num(germanFormat.parse(factor.NUMBER().text))
            factor.VAR() !== null -> Var(factor.VAR().text)
            else -> throw IllegalArgumentException("not a legal factor: ${factor.text}")
        }

    private val germanFormat = NumberFormat.getNumberInstance(Locale.GERMAN)
    init {
        germanFormat.maximumFractionDigits = germanFormat.maximumIntegerDigits
    }
}
