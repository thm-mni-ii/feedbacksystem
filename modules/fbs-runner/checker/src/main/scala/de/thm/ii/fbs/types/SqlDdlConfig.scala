package de.thm.ii.fbs.types

object SqlDdlConfig {
  val TABLE_STRUCTURE_QUERY =
    """SELECT
tc.table_schema,
tc.constraint_name,
tc.table_name,
kcu.column_name,
ccu.table_schema AS foreign_table_schema,
ccu.table_name AS foreign_table_name,
ccu.column_name AS foreign_column_name,
isc.table_schema,
isc.column_name,
isc.column_default,
isc.is_nullable,
isc.data_type,
isc.character_maximum_length,
isc.character_octet_length,
isc.numeric_precision,
isc.numeric_precision_radix,
isc.numeric_scale,
isc.udt_name,
isc.is_updatable
FROM
information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
ON tc.constraint_name = kcu.constraint_name
AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
ON ccu.constraint_name = tc.constraint_name
AND ccu.table_schema = tc.table_schema
JOIN information_schema.columns AS isc
ON isc.table_name = tc.table_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY
tc.table_schema,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema,
  ccu.table_name,
  ccu.column_name,
  isc.table_schema,
  isc.column_name,
  isc.column_default,
  isc.is_nullable,
  isc.data_type,
  isc.character_maximum_length,
  isc.character_octet_length,
  isc.numeric_precision,
  isc.numeric_precision_radix,
  isc.numeric_scale,
  isc.udt_name,
  isc.is_updatable;"""
}

