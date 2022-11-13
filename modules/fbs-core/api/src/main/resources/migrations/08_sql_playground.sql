BEGIN;

create table sql_playground_constraint (id integer not null auto_increment, check_clause varchar(255) not null, column_name varchar(255) not null, name varchar(255) not null, type varchar(255) not null, table_id integer not null, primary key (id));
create table sql_playground_database (id integer not null auto_increment, active bit not null, db_type varchar(255) not null, name varchar(255) not null, version varchar(255) not null, owner_id integer not null, primary key (id));
create table sql_playground_routine (id integer not null auto_increment, definition varchar(255) not null, name varchar(255) not null, type varchar(255) not null, database_id integer not null, primary key (id));
create table sql_playground_table (id integer not null auto_increment, columns varchar(255) not null, name varchar(255) not null, database_id integer not null, primary key (id));
create table sql_playground_trigger (id integer not null auto_increment, action varchar(255) not null, event varchar(255) not null, name varchar(255) not null, database_id integer not null, primary key (id));
create table sql_playground_view (id integer not null auto_increment, definition varchar(255) not null, table_name varchar(255) not null, database_id integer not null, primary key (id));

alter table sql_playground_constraint add constraint FKoos5max88cb7l5urfcep0p8da foreign key (table_id) references sql_playground_table (id);
alter table sql_playground_database add constraint FK2lpw2fd3ltsubhvat47bovpeo foreign key (owner_id) references user (user_id);
alter table sql_playground_routine add constraint FK2ejeyim0b7tc3n5m9xxntcdkw foreign key (database_id) references sql_playground_database (id);
alter table sql_playground_table add constraint FKdcywq40smk7uqd79tv98jwaj2 foreign key (database_id) references sql_playground_database (id);
alter table sql_playground_trigger add constraint FK5ca3su1pbglaeuj75fnibciwq foreign key (database_id) references sql_playground_database (id);
alter table sql_playground_view add constraint FKj2vubjqmjhu91owrw63ja6vub foreign key (database_id) references sql_playground_database (id);

INSERT INTO migration (number) VALUES (8);

COMMIT;
