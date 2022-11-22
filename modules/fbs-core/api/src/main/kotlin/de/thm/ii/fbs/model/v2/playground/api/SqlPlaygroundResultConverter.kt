package de.thm.ii.fbs.model.v2.playground.api

import de.thm.ii.fbs.utils.v2.converters.JpaJsonConverter

class SqlPlaygroundResultConverter : JpaJsonConverter<SqlPlaygroundResult>(SqlPlaygroundResult::class)
