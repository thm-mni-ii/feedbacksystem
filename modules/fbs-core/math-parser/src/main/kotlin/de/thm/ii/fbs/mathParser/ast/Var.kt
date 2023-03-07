package de.thm.ii.fbs.mathParser.ast

data class Var(val content: String) : Expr() {
    override fun toDot(sb: StringBuilder, i: Int): Int {
        val j = i + 1
        sb.append("$j [label=${content}]\n")
        return j
    }
}
