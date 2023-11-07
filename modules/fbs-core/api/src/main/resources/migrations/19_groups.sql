BEGIN;

CREATE TABLE user_group (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(64) NOT NULL,
    access_key VARCHAR(64) NOT NULL UNIQUE,
    creator_user_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (creator_user_id) REFERENCES user(user_id) ON UPDATE CASCADE ON DELETE SET DEFAULT
);
CREATE TABLE user_group_membership (
    group_id INT,
    members_user_id INT,
    PRIMARY KEY (group_id, members_user_id)
);

INSERT INTO migration (number) VALUES (19);
COMMIT;
