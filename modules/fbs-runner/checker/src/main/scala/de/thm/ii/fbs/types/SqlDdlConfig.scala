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
                               AND table_type = 'BASE TABLE' ORDER BY table_schema, TABLE_NAME) ORDER BY
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
                                 identity_minimum, identity_cycle, is_generated, generation_expression, is_updatable; """
}
//SELECT
//tc.table_schema,
//tc.constraint_name,
//tc.table_name,
//kcu.column_name,
//ccu.table_schema AS foreign_table_schema,
//ccu.table_name AS foreign_table_name,
//ccu.column_name AS foreign_column_name,
//isc.table_catalog,
//isc.table_schema,
//isc.column_name,
//isc.ordinal_position,
//isc.column_default,
//isc.is_nullable,
//isc.data_type,
//isc.character_maximum_length,
//isc.character_octet_length,
//isc.numeric_precision,
//isc.numeric_precision_radix,
//isc.numeric_scale,
//isc.udt_name,
//isc.dtd_identifier,
//isc.is_updatable
//FROM
//information_schema.table_constraints AS tc
//JOIN information_schema.key_column_usage AS kcu
//ON tc.constraint_name = kcu.constraint_name
//AND tc.table_schema = kcu.table_schema
//JOIN information_schema.constraint_column_usage AS ccu
//ON ccu.constraint_name = tc.constraint_name
//AND ccu.table_schema = tc.table_schema
//JOIN information_schema.columns AS isc
//ON isc.table_name = tc.table_name
//WHERE tc.constraint_type = 'FOREIGN KEY';
