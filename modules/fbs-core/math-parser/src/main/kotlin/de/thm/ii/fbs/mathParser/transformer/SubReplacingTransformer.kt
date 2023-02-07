package de.thm.ii.fbs.mathParser.transformer

import de.thm.ii.fbs.mathParser.ast.Expr
import de.thm.ii.fbs.mathParser.ast.Operation
import de.thm.ii.fbs.mathParser.ast.Operator
import de.thm.ii.fbs.mathParser.ast.UnaryOperation

class SubReplacingTransformer : BaseTransformer() {
    override fun transformOperation(input: Operation): Expr {
        if (input.operator == Operator.SUB) {
            val normalizedLeft = transformExpresion(input.left)
            val normalizedRight = transformExpresion(input.right)

            return Operation(Operator.ADD, normalizedLeft, UnaryOperation(Operator.SUB, normalizedRight))
        }

        return super.transformOperation(input)
    }
}
