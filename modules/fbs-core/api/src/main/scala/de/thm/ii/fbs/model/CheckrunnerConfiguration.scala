package de.thm.ii.fbs.model

import com.fasterxml.jackson.annotation.{JsonIgnore, JsonProperty}

/**
 * Checker configuration
 *
 * @param checkerType           The checker type, identifies the checkrunner
 * @param ord                   The checkrunner position in the order of checkrunner for a task
 * @param mainFileUploaded      True if the main file for a checker was uploaded
 * @param secondaryFileUploaded True if the secondary file for a checker was uploaded
 * @param id                    The configuration id, if 0, then an id was not assigned by the system
 */
case class CheckrunnerConfiguration(@JsonProperty checkerType: String,
                                    @JsonProperty ord: Int,
                                    @JsonProperty mainFileUploaded: Boolean = false,
                                    @JsonProperty secondaryFileUploaded: Boolean = false,
                                    @JsonIgnore id: Int = 0,
                                    @JsonIgnore taskId: Int = 0,
                                    @JsonProperty checkerTypeInformation: Option[CheckerTypeInformation] = None,
                                    @JsonProperty isInBlockStorage: Boolean = false
)
