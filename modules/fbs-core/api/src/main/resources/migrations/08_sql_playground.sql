BEGIN;

create table sql_entity (id integer not null auto_increment, data varchar(255), type varchar(255) not null, database_id integer not null, primary key (id)) engine=InnoDB;
create table sql_playground_database (id integer not null auto_increment, active bit not null, db_type varchar(255) not null, name varchar(255) not null, version varchar(255) not null, owner_user_id integer not null, primary key (id)) engine=InnoDB;
create table sql_playground_query (id integer not null auto_increment, result tinyblob, statement varchar(255) not null, run_in_id integer not null, primary key (id)) engine=InnoDB;

alter table sql_entity add constraint FKlsjoyy6rmx6b8jrsstlpn75mv foreign key (database_id) references sql_playground_database (id) on delete cascade on update cascade ;
alter table sql_playground_database add constraint FKlpv75fcg3ndh4gbb3cuo76leb foreign key (owner_user_id) references user (user_id) on delete cascade on update cascade ;
alter table sql_playground_query add constraint FK65u5q1tv8i6y19g9cv8ygpyxe foreign key (run_in_id) references sql_playground_database (id) on delete cascade on update cascade ;

INSERT INTO migration (number) VALUES (8);

COMMIT;
