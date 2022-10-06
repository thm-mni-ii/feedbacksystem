package de.thm.ii.fbs.types

object SqlDdlConfig {
  val TABLE_STRUCTURE_QUERY = """select
                               table_schema , table_name, column_name , ordinal_position
                               ,column_default, is_nullable, data_type, character_maximum_length,
                               character_octet_length, numeric_precision,
                               numeric_precision_radix, numeric_scale,
                               datetime_precision, interval_type,
                               interval_precision, character_set_catalog,
                               character_set_schema, character_set_name,
                               collation_catalog, collation_schema, collation_name , domain_catalog, domain_schema, domain_name,
                               scope_catalog, scope_schema, scope_name,
                               maximum_cardinality, dtd_identifier, is_self_referencing, is_identity,
                               identity_generation, identity_start, identity_increment, identity_maximum,
                               identity_minimum, identity_cycle, is_generated, generation_expression, is_updatable
                               from information_schema.columns where table_name IN
                               (SELECT table_name FROM information_schema.tables
                               WHERE table_schema not in ('information_schema', 'pg_catalog')
                               AND table_type = 'BASE TABLE' ORDER BY table_schema, TABLE_NAME);"""
}
