package de.thm.ii.fbs.types

import de.thm.ii.fbs.util.DBTypes

case class Database(id: Int,
                    name: String,
                    // Currently only Postgresql is supported
                    dbType: String = DBTypes.PSQL_CONFIG_KEY)
