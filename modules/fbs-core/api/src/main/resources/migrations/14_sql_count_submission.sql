BEGIN;
CREATE TRIGGER checkAttempts before insert on user_task_submission FOR EACH ROW BEGIN
    set @attempts = (SELECT count(submission_id)
          FROM user_task_submission
          WHERE user_id = New.user_id AND task_id = New.task_id);

    set @maxAttempts = (SELECT CASE WHEN attempts IS NULL THEN -1 ELSE attempts END
    FROM task
    WHERE task_id = NEW.task_id);

    IF @maxAttempts != -1 AND @attempts + 1 > @maxAttempts THEN
     signal sqlstate '45000';
    END IF;
END;

ALTER TABLE task ADD COLUMN attempts INTEGER;

INSERT INTO migration (number) VALUES (14);

COMMIT;
