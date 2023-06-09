package de.thm.ii.fbs.model.v2

import com.fasterxml.jackson.databind.JsonNode

/**
 * Check result of a single check
 *
 * @param exitCode        Exit code of the check
 * @param resultText      Output text of the checker
 * @param checkerType     The checker type that checked the submission
 * @param configurationId Checker configuration id
 * @param extInfo         Checker extended information
 */
data class CheckResult(val exitCode: Int = 1, val resultText: String, val checkerType: String, val configurationId: Int, val extInfo: JsonNode)
