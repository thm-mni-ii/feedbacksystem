package de.thm.ii.fbs.model

import com.fasterxml.jackson.annotation.JsonProperty

/**
  * The MediaInformation
  */
abstract sealed class MediaInformation

/**
  * The Spreadsheet Media Information
  *
  * @param idField the idField
  * @param inputFields the inputFields
  * @param outputFields the outputFields
  */
case class SpreadsheetMediaInformation(@JsonProperty("idField") idField: String,
                                       @JsonProperty("inputFields") inputFields: String,
                                       @JsonProperty("outputFields") outputFields: String) extends MediaInformation
