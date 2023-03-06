package de.thm.ii.fbs.mathParser.transformers.rules.transformers

import de.thm.ii.fbs.mathParser.ast.Expr
import de.thm.ii.fbs.mathParser.ast.Operation

fun interface OperationTransformer {
    fun transform(operation: Operation): Expr
}
