package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.*
import de.thm.ii.fbs.mathParser.transformer.*
import java.math.RoundingMode

class SemanticAstComparator(private val decimals: Int, private val roundingMode: RoundingMode = RoundingMode.HALF_UP) {
    private val transformerConfig = TransformerConfig(decimals, roundingMode)

    fun compare(base: Ast, other: Ast): Boolean {
        val l = normalize(base)
        val r = normalize(other)
        return l == r
    }
    private fun normalize(ast: Ast): Ast = ChainTransformer(
        NumberScalingTransformer(transformerConfig),
        RemoveNeutralMultiplicationTransformer(transformerConfig),
        SubReplacingTransformer(),
        CommutativeLawTransformer(),
   ).transform(ast)
}
