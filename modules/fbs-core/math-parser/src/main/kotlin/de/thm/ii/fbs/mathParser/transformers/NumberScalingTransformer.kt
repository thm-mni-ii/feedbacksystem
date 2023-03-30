package de.thm.ii.fbs.mathParser.transformers

import de.thm.ii.fbs.mathParser.ast.Expr
import de.thm.ii.fbs.mathParser.ast.Num

class NumberScalingTransformer(private val config: TransformerConfig) : BaseTransformer() {
    override fun transformNumber(input: Num): Expr =
        Num(config.setScale(input.content))
}
