package de.thm.ii.fbs.mathParser.transformers.rules

import de.thm.ii.fbs.mathParser.ast.Expr

interface Rule {
    fun matches(expr: Expr): Boolean
    fun apply(expr: Expr): Expr
}
