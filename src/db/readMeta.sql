SELECT
    c.table_schema,
    c.table_name,
    obj_description(pc.oid, 'pg_class') AS table_comment,

    c.ordinal_position,
    c.column_name,
    c.data_type,
    c.udt_name,
    c.character_maximum_length,
    c.numeric_precision,
    c.numeric_scale,
    c.is_nullable,
    c.column_default,

    col_description(pc.oid, c.ordinal_position) AS column_comment,

    CASE
        WHEN pk.column_name IS NOT NULL THEN true
        ELSE false
    END AS is_primary_key,

    fk.constraint_name AS foreign_key_name,
    fk.foreign_table_name,
    fk.foreign_column_name,
    fk.update_rule,
    fk.delete_rule

FROM information_schema.columns c

JOIN pg_catalog.pg_class pc
    ON pc.relname = c.table_name

JOIN pg_catalog.pg_namespace pn
    ON pn.oid = pc.relnamespace
   AND pn.nspname = c.table_schema

LEFT JOIN (
    SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.constraint_schema = kcu.constraint_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
) pk
    ON pk.table_schema = c.table_schema
   AND pk.table_name = c.table_name
   AND pk.column_name = c.column_name

LEFT JOIN (
    SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        tc.constraint_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule,
        rc.delete_rule
    FROM information_schema.table_constraints tc

    JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.constraint_schema = kcu.constraint_schema

    JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
       AND ccu.constraint_schema = tc.constraint_schema

    JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name
       AND rc.constraint_schema = tc.constraint_schema

    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
) fk
    ON fk.table_schema = c.table_schema
   AND fk.table_name = c.table_name
   AND fk.column_name = c.column_name

WHERE c.table_schema = 'public'

ORDER BY
    c.table_name,
    c.ordinal_position;