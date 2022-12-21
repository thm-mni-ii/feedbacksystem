package de.thm.ii.fbs.mathParser.ast

import java.math.BigDecimal
import kotlin.Number

data class Num(val content: BigDecimal) : Expr() {
    constructor(number: Number) : this(BigDecimal(number.toString()))
}
