package de.thm.ii.fbs.mathParser.ast

import java.math.BigDecimal
import kotlin.Number

data class Num(val content: BigDecimal) : Expr() {
    constructor(number: String) : this(BigDecimal(number))
    constructor(number: Number) : this(number.toString())

    override fun toDot(sb: StringBuilder, i: Int): Int {
        val j = i + 1
        sb.append("$j [label=${content}]\n")
        return j
    }
}
