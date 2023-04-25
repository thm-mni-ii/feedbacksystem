BEGIN;

create table sql_users (id integer not null auto_increment, user_id integer not null, database_id integer not null, primary key (id)) engine=InnoDB;
alter table sql_users add constraint sql_users_db_fk foreign key (database_id) references sql_playground_database (id) on delete cascade on update cascade ;
alter table sql_users add constraint sql_users_user_fk foreign key (user_id) references user (user_id) on delete cascade on update cascade ;


ALTER TABLE sql_playground_query ADD COLUMN creator_id integer not null;

INSERT INTO migration (number) VALUES (17);

COMMIT;
