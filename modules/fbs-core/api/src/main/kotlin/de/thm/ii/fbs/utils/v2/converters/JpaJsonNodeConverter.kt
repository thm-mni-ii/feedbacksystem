package de.thm.ii.fbs.utils.v2.converters

import tools.jackson.databind.JsonNode

class JpaJsonNodeConverter : JpaJsonConverter<JsonNode>(JsonNode::class)
