package de.thm.ii.fbs.mathParser.transformers

import de.thm.ii.fbs.mathParser.ast.*
import de.thm.ii.fbs.mathParser.transformers.rules.Rule

open class RuleBasedTransformer(private vararg val rules: Rule) : BaseTransformer() {
    override fun transformOperation(input: Operation): Expr {
        val transformed = super.transformOperation(input)

        for (rule in rules) {
            if (rule.matches(transformed)) {
                return rule.apply(transformed)
            }
        }

        return transformed
    }
}
