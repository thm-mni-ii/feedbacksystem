package de.thm.ii.fbs.mathParser.transformer

import de.thm.ii.fbs.mathParser.ast.*
import java.lang.Exception

abstract class BaseTransformer : Transformer {
    override fun transform(input: Ast): Ast =
        Ast(transformExpresion(input.root))

    fun transformExpresion(input: Expr): Expr = when (input) {
        is Operation -> transformOperation(input)
        is UnaryOperation -> transformUnaryOperation(input)
        is Num -> transformNumber(input)
        is Var -> transformVariable(input)
        else -> throw Exception("unsupported expr type ${input::class.simpleName}")
    }

    open fun transformOperation(input: Operation): Expr =
        Operation(transformOperator(input.operator), transformExpresion(input.left), transformExpresion(input.right))

    open fun transformUnaryOperation(input: UnaryOperation): Expr =
        UnaryOperation(transformOperatorUnary(input.operator), transformExpresion(input.target))

    open fun transformOperator(input: Operator): Operator = input

    open fun transformOperatorUnary(input: Operator): Operator = input

    open fun transformNumber(input: Num): Expr = input

    open fun transformVariable(input: Var): Expr = input
}
