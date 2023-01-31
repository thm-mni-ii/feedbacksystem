package de.thm.ii.fbs.mathParser.ast

abstract class Expr {
    abstract fun toDot(sb: StringBuilder, i: Int): Int
}
