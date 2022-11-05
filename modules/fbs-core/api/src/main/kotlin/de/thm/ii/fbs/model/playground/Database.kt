package de.thm.ii.fbs.model.playground

data class DatabaseCreation(val name: String)

data class Database(val id: String, val name: String, val version: String, val dbType: String)
