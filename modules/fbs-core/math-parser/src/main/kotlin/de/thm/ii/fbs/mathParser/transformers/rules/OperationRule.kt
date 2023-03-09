package de.thm.ii.fbs.mathParser.transformers.rules

import de.thm.ii.fbs.mathParser.ast.Expr
import de.thm.ii.fbs.mathParser.ast.Operation

abstract class OperationRule : Rule {
    abstract fun matchesOperation(operation: Operation): Boolean
    abstract fun applyOperation(operation: Operation): Expr

    override fun matches(expr: Expr): Boolean = expr is Operation && matchesOperation(expr)
    override fun apply(expr: Expr): Expr = applyOperation(expr as Operation)
}
