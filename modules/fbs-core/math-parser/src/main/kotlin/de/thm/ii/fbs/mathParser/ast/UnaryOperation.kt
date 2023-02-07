package de.thm.ii.fbs.mathParser.ast

data class UnaryOperation(val operator: Operator, val target: Expr) : Expr() {
    override fun toDot(sb: StringBuilder, i: Int): Int {
        val targetDot = target.toDot(sb, i)
        val operatorDot = operator.toDot(sb, targetDot)
        sb.append("$targetDot -- $operatorDot\n")
        return operatorDot
    }
}
