create table abteilung (
	ANr int,
    AName varchar(30),
    primary key (ANr)
);

create table mitarbeiter (
	PNr int not null,
    Name varchar (20),
    ANr int,
    Gehalt decimal,
    primary key(PNr),
    foreign key (ANr) references abteilung(ANr)
);

create table hotel (
	HNr int not null,
    HName varchar (60),
    Kategorie varchar(20),
    PLZ int,
    Ort varchar(30),
    primary key (HNr)
);

create table reisen (
	Mitarbeiter int not null,
    Hotel int not null,
    Beginndatum date,
    Dauer int,
    Kosten decimal,
    primary key (Mitarbeiter, Beginndatum),
    foreign key (Mitarbeiter) references mitarbeiter(PNr),
    foreign key (Hotel) references hotel(HNr)
);

insert into abteilung values 
	(1, "Vertrieb"),
	(2, "Buchhaltung"),
    (3, "Produktion"),
    (4, "Marketing");
    
insert into mitarbeiter values
	(1, "Meier", 2, 2300),
    (2, "MÃ¼ller", 3, 3100),
    (3, "Schmidt", 2, 2450),
    (4, "Wagner", 1, 3420),
    (5, "Rainerts", 4, 2850),
    (6, "Vogt", 1, 4100),
    (7, "Schultheiss", 1, 3950);
    
insert into hotel values
	(1, "City Hotel", "Business", 80331, "MÃ¼nchen"),
    (2, "City Inn", "Business", 50667, "KÃ¶ln"),
    (3, "Motel Five", "Wellness", 20038, "Hamburg"),
    (4, "Adlon", "Wellness", 10117, "Berlin"),
    (5, "Mariott", "Business", 61169, "Frankfurt"),
    (6, "Hotel Valeria", "Wellness", 70173, "Stuttgart"),
    (7, "Hotel Donaublick", "Family", 93047, "Regensburg"),
    (8, "Hotel Alte Post", "Family", 28195, "Bremen"),
    (9, "Hotel Garni", "Business", 76131, "Karlsruhe"),
    (10, "Holiday Inn", "Family", 50667, "KÃ¶ln");
    
insert into reisen values
	(2, 8, "2011-05-06", 2, 380),
    (2, 3, "2013-07-30", 2, 420),
    (5, 2, "2014-05-24", 3, 420),
    (4, 5, "2014-06-23", 4, 530),
    (5, 10, "2014-08-19", 2, 278),
    (5, 8, "2014-08-24", 2, 410),
    (1, 5, "2014-09-03", 2, 240),
    (4, 3, "2015-02-07", 3, 480),
    (1, 7, "2015-03-22", 5, 760),
    (4, 7, "2015-04-05", 3, 320),
    (2, 10, "2015-05-12", 4, 760),
    (5, 10, "2015-05-12", 1, 150),
    (5, 3, "2015-06-16", 3, 545),
    (1, 2, "2015-12-07", 3, 300),
    (2, 2, "2015-12-07", 1, 150),
    (3, 5, "2015-12-07", 4, 640),
    (4, 2, "2015-12-07", 1, 120);
