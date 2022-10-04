package de.thm.ii.fbs.types

object SqlDdlConfig {
  val TABLE_STRUCTURE_QUERY = """select * from information_schema.columns where table_name IN
    (SELECT table_name FROM information_schema.tables
    WHERE table_schema not in ('information_schema', 'pg_catalog')
    AND table_type = 'BASE TABLE' ORDER BY table_schema, TABLE_NAME);"""
}
