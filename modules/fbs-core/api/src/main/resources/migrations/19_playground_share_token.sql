BEGIN;

CREATE TABLE sql_playground_share
(
    database_id   INT       NOT NULL,
    creation_time TIMESTAMP NOT NULL,
    CONSTRAINT sql_playground_share_pk
        PRIMARY KEY (database_id),
    constraint sql_playground_share_sql_playground_database_id_fk
        FOREIGN KEY (database_id) references sql_playground_database (id)
        ON UPDATE CASCADE
);


INSERT INTO migration (number) VALUES (19);
COMMIT;
