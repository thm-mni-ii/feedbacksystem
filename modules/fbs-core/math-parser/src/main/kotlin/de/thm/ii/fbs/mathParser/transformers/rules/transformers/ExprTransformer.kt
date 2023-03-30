package de.thm.ii.fbs.mathParser.transformers.rules.transformers

import de.thm.ii.fbs.mathParser.ast.Expr

fun interface ExprTransformer {
    fun transform(expr: Expr): Expr
}
