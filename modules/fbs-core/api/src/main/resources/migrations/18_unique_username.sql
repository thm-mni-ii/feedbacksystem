BEGIN;

-- When multiple users with the same username exist append a random uuid to all expect the first users (this will not break user logins as currently only the first user can login with their username)
DELIMITER //
CREATE PROCEDURE MakeUsernamesUnique()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE a INT;
  DECLARE i INT DEFAULT 1;
  DECLARE cur CURSOR FOR SELECT DISTINCT u2.user_id FROM user u2 JOIN user u1 ON u1.username = u2.username AND u1.user_id < u2.user_id;
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

OPEN cur;

read_loop: LOOP
    FETCH cur INTO a;
    IF done THEN
      LEAVE read_loop;
END IF;

UPDATE user SET username = CONCAT(username, "-", i) WHERE id = a;
SET i = i + 1;

END LOOP;

CLOSE cur;
END;
//
DELIMITER ;

CALL MakeUsernamesUnique();
DROP PROCEDURE MakeUsernamesUnique;

ALTER TABLE user ADD UNIQUE (username);

INSERT INTO migration (number) VALUES (18);
COMMIT;
