BEGIN;

-- When multiple users with the same username exist append a random uuid to all expect the first users (this will not break user logins as currently only the first user can login with their username)
UPDATE user u2 JOIN user u1 ON u1.username = u2.username AND u1.user_id < u2.user_id SET u2.username = CONCAT(u2.username, "-", HEX(RANDOM_BYTES(4)));

ALTER TABLE user ADD UNIQUE (username);

INSERT INTO migration (number) VALUES (18);
COMMIT;
