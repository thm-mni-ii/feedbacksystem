package de.thm.ii.fbs.mathParser.ast

data class Operation(val operator: Operator, val left: Expr, val right: Expr) : Expr()
