BEGIN;

-- When multiple users with the same username exist append a random uuid to all expect the first users (this will not break user logins as currently only the first user can login with their username)
DELIMITER //
CREATE PROCEDURE MakeUsernamesUnique()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE a INT;
  DECLARE cur CURSOR FOR SELECT user_id FROM user;
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

OPEN cur;

read_loop: LOOP
    FETCH cur INTO a;
    IF done THEN
      LEAVE read_loop;
END IF;

UPDATE user SET username = CONCAT(username, "-", HEX(RANDOM_BYTES(4))) WHERE user_id = a;
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
