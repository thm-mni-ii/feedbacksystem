package de.thm.ii.fbs.types

object SqlDdlConfig {
  val TABLE_STRUCTURE_QUERY =
    """SELECT
isc.table_schema AS "Table Schema",
isc.table_name AS "Table Name",
isc.column_name AS "Column Name",
isc.column_default AS "Column Default",
isc.is_nullable AS "is Nullable",
isc.data_type AS "Data Type",
isc.character_maximum_length as "Character Maximum Length",
isc.character_octet_length as "Character Octet Length",
isc.numeric_precision as "Numeric Precision",
isc.numeric_precision_radix AS "Numeric Precision Radix",
isc.numeric_scale AS "Numeric Scale",
isc.udt_name AS "UDT Name",
isc.is_updatable AS "is Updatable",
tc.constraint_name AS "Constraint Name",
ccu.table_schema AS "Foreign Table Schema",
ccu.table_name AS "Foreign Table Name",
ccu.column_name AS "Foreign Column Name"
FROM
information_schema.columns AS isc
LEFT JOIN information_schema.constraint_column_usage AS ccu
ON ccu.table_schema = isc.table_schema
AND ccu.column_name = isc.column_name
Left JOIN information_schema.table_constraints AS tc
ON ccu.constraint_name = tc.constraint_name
AND isc.table_schema = tc.table_schema
AND isc.table_name = tc.table_name
Left JOIN information_schema.key_column_usage AS kcu
ON tc.constraint_name = kcu.constraint_name
AND tc.table_schema = kcu.table_schema
AND isc.column_name = kcu.column_name
WHERE isc.table_schema != 'pg_catalog'
AND isc.table_schema != 'information_schema'
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

