package de.thm.ii.fbs.utils.v2.converters

import com.fasterxml.jackson.databind.JsonNode

class JpaJsonNodeConverter : JpaJsonConverter<JsonNode>(JsonNode::class)
