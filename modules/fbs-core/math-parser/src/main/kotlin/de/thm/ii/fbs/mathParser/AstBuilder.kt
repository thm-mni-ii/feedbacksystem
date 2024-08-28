@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.*
import java.text.NumberFormat
import java.util.*

class AstBuilder(val eq: MathParser.EqContext) {
    fun build(): Ast =
        Ast(buildEquation(eq))

    private fun buildEquation(eq: MathParser.EqContext): Expr =
        when {
            eq.eq() !== null -> Operation(Operator.EQ, buildEquation(eq.eq()), buildExpr(eq.expr()))
            eq.expr() !== null -> buildExpr(eq.expr())
            else -> throw IllegalArgumentException("not a legal equation: ${eq.text}")
        }

    private fun buildExpr(expr: MathParser.ExprContext): Expr =
        when {
            expr.ADD() !== null -> Operation(Operator.ADD, buildExpr(expr.expr()), buildTerm(expr.term()))
            expr.SUB() !== null -> Operation(Operator.SUB, buildExpr(expr.expr()), buildTerm(expr.term()))
            expr.term() !== null -> buildTerm(expr.term())
            else -> throw IllegalArgumentException("not a legal expression: ${expr.text}")
        }

    private fun buildTerm(term: MathParser.TermContext): Expr =
        when {
            term.MUL() !== null -> Operation(Operator.MUL, buildTerm(term.term()), buildUnary(term.unary()))
            term.DIV() !== null -> Operation(Operator.DIV, buildTerm(term.term()), buildUnary(term.unary()))
            term.MOD() !== null -> Operation(Operator.MOD, buildTerm(term.term()), buildUnary(term.unary()))
            term.unary() !== null -> buildUnary(term.unary())
            else -> throw IllegalArgumentException("not a legal term: ${term.text}")
        }

    private fun buildUnary(unary: MathParser.UnaryContext): Expr =
        when {
            unary.funct() !== null ->
                if (unary.SUB() !== null) {
                    UnaryOperation(Operator.SUB, buildFunct(unary.funct()))
                } else {
                    buildFunct(unary.funct())
                }
            else -> throw IllegalArgumentException("not a legal unary: ${unary.text}")
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
            funct.mulFactor() !== null -> buildMulFactor(funct.mulFactor())
            else -> throw IllegalArgumentException("not a legal function: ${funct.text}")
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
            expo.unicode_expo() !== null -> Operation(Operator.EXP, buildExpo(expo.expo()), Num(expo.unicode_expo().text.map { superscriptMap[it] }.joinToString("")))
            else -> throw IllegalArgumentException("not a legal exponential: ${expo.text}")
        }

    private fun buildFactor(factor: MathParser.FactorContext): Expr =
        when {
            factor.expr() !== null -> buildExpr(factor.expr())
            factor.NUMBER() !== null -> Num(germanFormat.parse(factor.NUMBER().text.replace("{,}", ",")))
            factor.VAR() !== null -> Var(factor.VAR().text)
            factor.EMPTY_CURLY_BRACKETS() !== null -> Num(1)
            else -> throw IllegalArgumentException("not a legal factor: ${factor.text}")
        }

    private val germanFormat = NumberFormat.getNumberInstance(Locale.GERMAN)
    private val superscriptMap = mapOf('⁰' to '0', '¹' to '1', '²' to '2', '³' to '3', '⁴' to '4', '⁵' to '5', '⁶' to '6', '⁷' to '7', '⁸' to '8', '⁹' to '9')
    init {
        germanFormat.maximumFractionDigits = germanFormat.maximumIntegerDigits
    }
}
