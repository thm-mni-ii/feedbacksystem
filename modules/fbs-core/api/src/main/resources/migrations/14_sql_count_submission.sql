
BEGIN;

ALTER TABLE task ADD COLUMN try INTEGER ;

DELIMITER //

CREATE TRIGGER checktry before insert on submission
FOR EACH ROW

BEGIN
DECLARE anzahl INT;
DECLARE maxAnzahl INT;


SELECT count(submission_id) INTO anzahl
      FROM user_task_submission JOIN task USING(task_id) LEFT JOIN checker_result using (submission_id)
      LEFT JOIN checkrunner_configuration using (configuration_id)
      WHERE user_id = ? AND user_task_submission.task_id = ?
;

SELECT t.try INTO maxAnzahl
FROM submission s
JOIN checker c USING (checker_id)
JOIN task t USING (task_id)
WHERE s.submission_id = NEW.submission_id
;

if anzahl > maxAnzahl + 1 then
 signal sqlstate '45000';
 set new.val = NULL;
END IF;
END;
DELIMITER ;


INSERT INTO migration (number) VALUES (14);

COMMIT;