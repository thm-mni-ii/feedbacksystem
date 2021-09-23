BEGIN;

CREATE TABLE migration (number int, PRIMARY KEY (number));
INSERT INTO migration (number) VALUES (0);

COMMIT;
