package de.thm.ii.fbs.mathParser.ast

data class Operation(val operator: Operator, val left: Expr, val right: Expr) : Expr() {
    override fun toDot(sb: StringBuilder, i: Int): Int {
        val leftDot = left.toDot(sb, i)
        val rightDot = right.toDot(sb, leftDot)
        val operatorDot = operator.toDot(sb, rightDot)
        sb.append("$leftDot -- $operatorDot [label=l]\n$rightDot -- $operatorDot [label=r]\n")
        return operatorDot
    }
}
