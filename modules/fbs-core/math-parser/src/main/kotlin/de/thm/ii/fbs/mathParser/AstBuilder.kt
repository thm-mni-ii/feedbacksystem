@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.*
import java.text.NumberFormat
import java.util.*

class AstBuilder(val expr: MathParser.ExprContext) {
    fun build(): Ast =
        Ast(buildExpr(expr))

    private fun buildExpr(expr: MathParser.ExprContext): Expr =
        when {
            expr.ADD() !== null -> Operation(Operator.ADD, buildExpr(expr.expr()), buildTerm(expr.term()))
            expr.SUB() !== null -> Operation(Operator.SUB, buildExpr(expr.expr()), buildTerm(expr.term()))
            expr.term() !== null -> buildTerm(expr.term())
            else -> throw IllegalArgumentException("not a legal expression: ${expr.text}")
        }

    private fun buildTerm(term: MathParser.TermContext): Expr =
        when {
            term.MUL() !== null -> Operation(Operator.MUL, buildTerm(term.term()), buildFunct(term.funct()))
            term.DIV() !== null -> Operation(Operator.DIV, buildTerm(term.term()), buildFunct(term.funct()))
            term.MOD() !== null -> Operation(Operator.MOD, buildTerm(term.term()), buildFunct(term.funct()))
            term.funct() !== null -> buildFunct(term.funct())
            else -> throw IllegalArgumentException("not a legal term: ${term.text}")
        }

    private fun buildFunct(funct: MathParser.FunctContext): Expr =
        when {
            funct.LB() !== null -> Operation(Operator.LOG, Num(2), buildExpr(funct.expr(0)))
            funct.LN() !== null -> Operation(Operator.LOG, Num(Math.E), buildExpr(funct.expr(0)))
            funct.LG() !== null -> Operation(Operator.LOG, Num(10), buildExpr(funct.expr(0)))
            funct.FRAC() !== null -> Operation(Operator.DIV, buildExpr(funct.expr(0)), buildExpr(funct.expr(1)))
            funct.SQRT() !== null -> if (funct.expr().size <= 1) {
                Operation(Operator.RAD, Num(2), buildExpr(funct.expr(0)))
            } else {
                Operation(Operator.RAD, buildExpr(funct.expr(0)), buildExpr(funct.expr(1)))
            }
            funct.RAD() !== null -> Operation(Operator.RAD, buildExpr(funct.expr(0)), buildExpr(funct.expr(1)))
            funct.LOG() !== null -> Operation(Operator.LOG, buildExpr(funct.expr(0)), buildExpr(funct.expr(1)))
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
            mulFactor.mulFactor() !== null -> Operation(Operator.MUL, buildMulFactor(mulFactor.mulFactor()), buildExpo(mulFactor.expo()))
            mulFactor.expo() !== null -> buildExpo(mulFactor.expo())
            else -> throw IllegalArgumentException("not a legal mulFactor: ${mulFactor.text}")
        }

    private fun buildExpo(expo: MathParser.ExpoContext): Expr =
        when {
            expo.EXP() !== null -> Operation(Operator.EXP, buildExpo(expo.expo()), if (expo.SUB() !== null) UnaryOperation(Operator.SUB, buildFactor(expo.factor())) else buildFactor(expo.factor()))
            expo.factor() !== null -> buildFactor(expo.factor())
            else -> throw IllegalArgumentException("not a legal exponential: ${expo.text}")
        }

    private fun buildFactor(factor: MathParser.FactorContext): Expr =
        when {
            factor.expr() !== null -> buildExpr(factor.expr())
            factor.NUMBER() !== null -> Num(germanFormat.parse(factor.NUMBER().text.replace("{,}", ",")))
            factor.VAR() !== null -> Var(factor.VAR().text)
            else -> throw IllegalArgumentException("not a legal factor: ${factor.text}")
        }

    private val germanFormat = NumberFormat.getNumberInstance(Locale.GERMAN)
    init {
        germanFormat.maximumFractionDigits = germanFormat.maximumIntegerDigits
    }
}
