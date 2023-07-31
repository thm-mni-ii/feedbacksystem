@file:Suppress("ktlint:no-wildcard-imports")

package de.thm.ii.fbs.mathParser.marshal

import de.thm.ii.fbs.mathParser.ast.*

class LatexMarshal : Marshal {
    private val marshalOperatorMap = mapOf(
        Operator.EQ to "=",
        Operator.ADD to "+",
        Operator.SUB to "-",
        Operator.MUL to "\\cdot",
        Operator.EXP to "^"
    )

    override fun marshal(input: Ast): String =
        marshalExpr(input.root)

    private fun marshalExpr(input: Expr): String =
        when (input) {
            is Operation -> marshalOperation(input)
            is UnaryOperation -> marshalUnaryOperation(input)
            is Var -> marshalVar(input)
            is Num -> marshalNum(input)
            else -> throw IllegalArgumentException("${input::class.qualifiedName} is not a marshalable expression")
        }

    private fun marshalNum(input: Num): String =
        input.content.toString()

    private fun marshalVar(input: Var): String =
        input.content

    private fun marshalUnaryOperation(input: UnaryOperation): String =
        when (input.operator) {
            Operator.SUB -> if (input.target is Operation) "-(${marshalExpr(input.target)})" else "-{${marshalExpr(input.target)}}"
            Operator.TEXT -> "\\text{${escapeForLatex((input.target as Text).content)}}"
            else -> throw IllegalArgumentException("$input Operator is not marshalable")
        }

    private fun marshalOperation(input: Operation): String =
        when (input.operator) {
            Operator.DIV -> "\\frac{${marshalExpr(input.left)}}{${marshalExpr(input.right)}}"
            Operator.RAD -> "\\sqrt[${marshalExpr(input.left)}]{${marshalExpr(input.right)}}"
            Operator.EXP -> "{${marshalExpr(input.left)}}^{${marshalExpr(input.right)}}"
            else -> buildOperationString(input)
        }

    private fun buildOperationString(input: Operation): String =
        if (input.left is Operation && input.operator > input.left.operator) {
            "(${marshalExpr(input.left)})"
        } else {
            marshalExpr(input.left)
        } + " ${marshalOperator(input.operator)} " + if (input.right is Operation && input.operator > input.right.operator) {
            "(${marshalExpr(input.right)})"
        } else {
            marshalExpr(input.right)
        }

    private fun marshalOperator(operator: Operator): String =
        marshalOperatorMap[operator] ?: throw IllegalArgumentException("$operator is not a marshalable operator")

    // Convert to kotlin from php original at https://stackoverflow.com/a/2541763
    private val latexEscapeMap = mapOf(
        "#" to "\\#",
        "$" to "\\$",
        "%" to "\\%",
        "&" to "\\&",
        "~" to "\\~{}",
        "_" to "\\_",
        "^" to "\\^{}",
        "\\" to "\\textbackslash{}",
        "{" to "\\{",
        "}" to "\\}",
    )
    private fun escapeForLatex(input: String): String =
        input.replace(Regex("([\\^%~\\\\#\$&_{}])")) { latexEscapeMap[it.value] ?: "" }

    override fun unmarshal(input: String): Ast {
        throw UnsupportedOperationException()
    }
}
