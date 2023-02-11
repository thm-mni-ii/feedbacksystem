package de.thm.ii.fbs.mathParser

import de.thm.ii.fbs.mathParser.ast.*
import de.thm.ii.fbs.mathParser.transformers.*
import java.math.RoundingMode

class SemanticAstComparator(
    decimals: Int = 2,
    roundingMode: RoundingMode = RoundingMode.HALF_UP,
    ignoreNeutralElements: Boolean = false,
    applyInverseElements: Boolean = false,
    applyCommutativeLaw: Boolean = false,
) {

    private val transformerConfig = TransformerConfig(decimals, roundingMode)

    fun compare(base: Ast, other: Ast): Boolean {
        val l = normalize(base)
        val r = normalize(other)
        return l == r
    }
    private fun normalize(ast: Ast): Ast = transformer.transform(ast)

    private val transformer = run {
        val transformers: MutableList<Transformer> = mutableListOf(NumberScalingTransformer(transformerConfig))
        if (ignoreNeutralElements) {
            transformers += listOf(NeutralElementTransformer(transformerConfig))
        }
        if (applyInverseElements) {
            transformers += listOf(InverseElementTransformer(transformerConfig))
        }
        if (applyCommutativeLaw) {
            transformers += listOf(
                SubReplacingTransformer(),
                CommutativeLawTransformer()
            )
        }
        ChainTransformer(
            *transformers.toTypedArray()
        )
    }
}
