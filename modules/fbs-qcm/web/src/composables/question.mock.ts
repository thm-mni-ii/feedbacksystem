export interface QuestionMockItem {
  _id: string
  owner?: number
  questiontext: string
  questiontags: string[]
  questiontype?: string
  questionconfiguration?: Record<string, unknown>
  difficulty: number
  multipleRow?: boolean
  multipleColumn?: boolean
  answerColumns?: Array<{ id: number; name: string }>
  optionRows?: Array<{ id: number; text: string; correctAnswers: number[] }>
  excludeFromAlgorithm?: boolean
  [key: string]: unknown
}

export const questionMocks: QuestionMockItem[] = [
  {
    _id: 'q-001',
    owner: 0,
    questiontext:
      "Was ist der zentrale Nachteil des klassischen 'Dateikonzepts' gegenüber dem Datenbankkonzept?",
    questiontags: ['c-datenorg-dateikonzept'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Es ermöglicht keine Mehrbenutzerzugriffe, weil zu viel Redundanz kontrolliert wird',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Durch die enge Verknüpfung von Anwendungsprogramm und Datenorganisation entstehen Redundanz und Inkonsistenz',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Es gibt keine Trennung zwischen Programmen, was zu geringerer Verarbeitungseffizienz führt',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Dateien können nicht persistent gespeichert werden',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-002',
    owner: 0,
    questiontext:
      'Kreuzen Sie an, ob die Eigenschaft laut Vorlesung ein Vorteil oder ein Nachteil des Datenbankkonzeptes ist.',
    questiontags: ['c-datenorg-dateikonzept'],
    questiontype: 'matrix',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Vorteil'
      },
      {
        id: 2,
        name: 'Nachteil'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Geringere Redundanz',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Höhere Qualifikationsanforderung an Mitarbeiter',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'Hohe Datenkonsistenz',
        correctAnswers: [1]
      },
      {
        id: 4,
        text: 'Geringere Verarbeitungseffizienz',
        correctAnswers: [2]
      },
      {
        id: 5,
        text: 'Besserer Datenschutz und -sicherung',
        correctAnswers: [1]
      }
    ]
  },
  {
    _id: 'q-003',
    owner: 0,
    questiontext: 'Welche der folgenden Aussagen über das Datenbankkonzept trifft zu?',
    questiontags: ['c-datenorg-dateikonzept'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Es fordert eine enge Kopplung von Daten und Anwendungsprogrammen',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Es steht für Standardisierung und Zentralisierung der Datenbestände sowie Trennung von Daten und Programmen',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Es verzichtet vollständig auf jegliche Kontrolle von Redundanz',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Es ist nur für Einzelplatzsysteme ohne Mehrbenutzerbetrieb geeignet',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-004',
    owner: 0,
    questiontext: 'Ordnen Sie jede Ebene ihrer korrekten Beschreibung zu.',
    questiontags: ['c-datenorg-architektur'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Benutzerspezifische Sicht auf die Daten je nach Informationsbedarf der Anwendung'
      },
      {
        id: 2,
        name: "Gesamtschema der Datenbank ('Data Dictionary') mit allen Integritätsbedingungen"
      },
      {
        id: 3,
        name: 'Festlegung, wie das Schema auf externen Speichern physisch abgelegt wird'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Externe Ebene',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Konzeptionelle Ebene',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'Interne Ebene',
        correctAnswers: [3]
      }
    ]
  },
  {
    _id: 'q-005',
    owner: 0,
    questiontext:
      'Welche Aussage zur konzeptionellen Ebene der Drei-Schichten-Architektur ist korrekt?',
    questiontags: ['c-datenorg-architektur'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Sie ist abhängig von der Form der physikalischen Speicherung',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Ihr Entwurf ist unabhängig von einzelnen Benutzeranforderungen und gilt als kreative Aufgabe im gesamten Entwicklungsprozess',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Sie definiert ausschließlich die Zugriffsrechte einzelner Benutzer',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Sie entspricht der internen Speicherstruktur der Datenbank',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-006',
    owner: 0,
    questiontext: 'Was ist die Intention des ANSI/SPARC-Schichtmodells?',
    questiontags: ['c-datenorg-architektur'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Maximierung der Redundanz zur Erhöhung der Ausfallsicherheit',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Unabhängigkeit von logischer und physischer Sicht auf die Daten',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Vollständige Abschaffung der externen Sicht zugunsten der internen Sicht',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Verzicht auf ein konzeptionelles Schema',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-007',
    owner: 0,
    questiontext:
      'Welche der folgenden Aufgaben gehört laut Vorlesung NICHT zu den klassischen Aufgaben eines Datenbankmanagementsystems (DBMS)?',
    questiontags: ['c-datenorg-dbms'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Definition und Verwaltung der Datenstrukturen',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Transaktionsmanagement (Koordination der Parallelverarbeitung, Recovery)',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Verwaltung von Zugriffsrechten und Schutz vor unberechtigten Zugriffen',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Physische Herstellung der Netzwerkinfrastruktur zwischen Servern',
        correctAnswers: [1]
      }
    ]
  },
  {
    _id: 'q-008',
    owner: 0,
    questiontext: 'Welche Aussage zu MySQL ist gemäß Vorlesung korrekt?',
    questiontags: ['c-datenorg-dbms'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'MySQL speichert Datenbanken als einzelne Datei, ähnlich wie MS Access',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Bei MySQL entsprechen Datenbanken Ordnern und Tabellen Dateien auf Dateiebene',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'MySQL wurde nie von einem anderen Unternehmen aufgekauft',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'MySQL ist ausschließlich für Desktop-Anwendungen konzipiert, nicht für Web-Anwendungen',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-009',
    owner: 0,
    questiontext: 'Wählen Sie für jedes Produkt die passende Charakterisierung.',
    questiontags: ['c-datenorg-dbms'],
    questiontype: 'matrix',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Relationales DBMS für PCs, Teil des Office-Pakets, Speicherung als *.mdb/*.accdb'
      },
      {
        id: 2,
        name: '(Transact)SQL-orientiert, auch als Data-Warehouse/BI-Plattform einsetzbar'
      },
      {
        id: 3,
        name: 'Populärstes Open-Source-DBMS, Grundlage vieler dynamischer Web-Anwendungen'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Microsoft Access',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Microsoft SQL-Server',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'MySQL',
        correctAnswers: [3]
      }
    ]
  },
  {
    _id: 'q-010',
    owner: 0,
    questiontext:
      "Die Gesamtheit der zu einem Zeitpunkt in einer Datenbank gespeicherten Daten wird als ____ bezeichnet und stellt einen 'Schnappschuss' der Datenbank dar.",
    questiontags: ['c-datenorg-dbms'],
    questiontype: 'fill-in-the-blank',
    questionconfiguration: {},
    difficulty: 2,
    showBlanks: false,
    textParts: [
      {
        order: 0,
        text: 'Die Gesamtheit der zu einem Zeitpunkt in einer Datenbank gespeicherten Daten wird als ',
        isBlank: false
      },
      {
        order: 1,
        text: 'Datenbankzustand',
        isBlank: true
      },
      {
        order: 2,
        text: " bezeichnet und stellt einen 'Schnappschuss' der Datenbank dar.",
        isBlank: false
      }
    ]
  },
  {
    _id: 'q-011',
    owner: 0,
    questiontext: 'Ordnen Sie jeden Begriff der passenden Definition zu.',
    questiontags: ['c-modellierung-grundbegriffe'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Abgrenzbares Objekt der Realität bzw. gedankliche Abstraktion'
      },
      {
        id: 2,
        name: 'Wechselseitiges Verhältnis/Verknüpfung zwischen zwei Entitäten'
      },
      {
        id: 3,
        name: 'Beschreibende Charakterisierung einer Entität oder Beziehung'
      },
      {
        id: 4,
        name: 'Menge aller zulässigen Werte/Ausprägungen eines Attributes'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Entität',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Beziehung (Relationship)',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'Attribut',
        correctAnswers: [3]
      },
      {
        id: 4,
        text: 'Domäne',
        correctAnswers: [4]
      }
    ]
  },
  {
    _id: 'q-012',
    owner: 0,
    questiontext:
      'Welches Symbol wird im klassischen ER-Modell für einen Relationship-Typ (R-Typ) verwendet?',
    questiontags: ['c-modellierung-grundbegriffe'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Rechteck',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Raute',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Kreis/Ellipse',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Doppellinie',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-013',
    owner: 0,
    questiontext: 'Was ist eine Entitätsmenge (Entity Set)?',
    questiontags: ['c-modellierung-grundbegriffe'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Alle zu einem Zeitpunkt existierenden Entitäten des gleichen Entitätstyps',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Die Menge aller Attribute einer Entität',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Eine Zusammenfassung mehrerer Entity-Typen zu einem Relationship-Typ',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Der Wertebereich eines Schlüsselattributs',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-014',
    owner: 0,
    questiontext:
      'Wer entwickelte das Entity-Relationship-Modell (ERM) und in welchem Jahr wurde es veröffentlicht?',
    questiontags: ['c-modellierung-grundbegriffe'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'P. P. Chen, 1976',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'E. F. Codd, 1970',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Grady Booch, 1994',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'C. J. Date, 1980',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-015',
    owner: 0,
    questiontext:
      'Attribute, die mehrere Werte gleichzeitig annehmen können, werden im ERM als ____ bezeichnet und mit einem doppelten Kreis/Ellipse dargestellt.',
    questiontags: ['c-modellierung-grundbegriffe'],
    questiontype: 'fill-in-the-blank',
    questionconfiguration: {},
    difficulty: 3,
    showBlanks: false,
    textParts: [
      {
        order: 0,
        text: 'Attribute, die mehrere Werte gleichzeitig annehmen können, werden im ERM als ',
        isBlank: false
      },
      {
        order: 1,
        text: 'mehrwertige Attribute',
        isBlank: true,
        acceptedAlternatives: ['mehrwertiges Attribut']
      },
      {
        order: 2,
        text: ' bezeichnet und mit einem doppelten Kreis/Ellipse dargestellt.',
        isBlank: false
      }
    ]
  },
  {
    _id: 'q-016',
    owner: 0,
    questiontext: 'Kreuzen Sie für jeden Assoziationstyp die zutreffende Beschreibung an.',
    questiontags: ['c-modellierung-kardinalitaeten'],
    questiontype: 'matrix',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'genau eine'
      },
      {
        id: 2,
        name: 'keine oder eine'
      },
      {
        id: 3,
        name: 'mindestens eine'
      },
      {
        id: 4,
        name: 'keine, eine oder mehrere'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'einfach (Symbol: 1)',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'konditionell (Symbol: c)',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'multipel (Symbol: m)',
        correctAnswers: [3]
      },
      {
        id: 4,
        text: 'multipel-konditionell (Symbol: mc)',
        correctAnswers: [4]
      }
    ]
  },
  {
    _id: 'q-017',
    owner: 0,
    questiontext:
      "Ein Fahrzeug hat genau einen Halter (Person), eine Person kann jedoch mehrere Fahrzeuge besitzen. Welche Kardinalität liegt in der Beziehung 'Person – besitzt – Fahrzeug' vor (Person:Fahrzeug)?",
    questiontags: ['c-modellierung-kardinalitaeten'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: '1:1',
        correctAnswers: []
      },
      {
        id: 2,
        text: '1:mc (bzw. 1:m)',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'c:1',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'mc:mc',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-018',
    owner: 0,
    questiontext: 'Was bedeutet die Min-Max-Notation (0,*) an einer Kante einer Beziehung?',
    questiontags: ['c-modellierung-kardinalitaeten'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Genau ein Objekt der anderen Seite ist zugeordnet',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Mindestens ein, aber maximal unbegrenzt viele Objekte der anderen Seite sind zugeordnet',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Keine oder beliebig viele Objekte der anderen Seite können zugeordnet sein',
        correctAnswers: [1]
      },
      {
        id: 4,
        text: 'Genau null oder genau ein Objekt ist zugeordnet',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-019',
    owner: 0,
    questiontext:
      "Welche Kombination aus Min-Max-Werten entspricht der klassischen Chen-Notation 'c' (konditionell)?",
    questiontags: ['c-modellierung-kardinalitaeten'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: '(1,1)',
        correctAnswers: []
      },
      {
        id: 2,
        text: '(0,1)',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: '(1,*)',
        correctAnswers: []
      },
      {
        id: 4,
        text: '(0,*)',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-020',
    owner: 0,
    questiontext: 'Bei der Min-Max-Notation im ERM: Was gibt der Min-Wert einer Kante an?',
    questiontags: ['c-modellierung-kardinalitaeten'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Die maximale Anzahl der Objekte, die zugeordnet werden können',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Die minimale Anzahl der Objekte, die zugeordnet werden müssen',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Die durchschnittliche Anzahl zugeordneter Objekte',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Die Anzahl der Attribute des Entity-Typs',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-021',
    owner: 0,
    questiontext: "Was versteht man unter einem 'schwachen Entity-Typ' (schwacher Objekttyp)?",
    questiontags: ['c-modellierung-schluessel'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Einen Entity-Typ ohne Attribute',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Einen von einem anderen Entity-Typ B abhängigen Entity-Typ A, dessen Schlüssel den Schlüssel von B enthält',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Einen Entity-Typ, der nie in einer Beziehung vorkommt',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Einen Entity-Typ mit nur einem einzigen Datensatz',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-022',
    owner: 0,
    questiontext:
      'Welches der folgenden Kriterien gehört NICHT zu den Kriterien zur Wahl eines Identifikationsschlüssels laut Vorlesung?',
    questiontags: ['c-modellierung-schluessel'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Eindeutigkeit',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Unveränderlichkeit',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Kürze',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Möglichst hoher numerischer Wert',
        correctAnswers: [1]
      }
    ]
  },
  {
    _id: 'q-023',
    owner: 0,
    questiontext:
      'Was passiert bei der Schlüsselvererbung zwischen einem E-Typ und dem adjazenten R-Typ?',
    questiontags: ['c-modellierung-schluessel'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Der Primärschlüssel des E-Typs wird implizit an den R-Typ vererbt und bildet i.d.R. Teil von dessen Primärschlüssel',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Der R-Typ erhält einen völlig neuen, unabhängigen Schlüssel ohne Bezug zum E-Typ',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Nur Nichtschlüsselattribute werden vererbt, niemals der Primärschlüssel',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Schlüsselvererbung findet nur bei schwachen Entitätstypen statt',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-024',
    owner: 0,
    questiontext: 'Welche Regel beschreibt referentielle Integrität am besten?',
    questiontags: ['c-modellierung-schluessel'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Datensätze dürfen über ihre Fremdschlüssel nur auf existierende Datensätze in der referenzierten Tabelle verweisen',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Jede Tabelle muss mindestens zwei Fremdschlüssel besitzen',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Primärschlüssel dürfen niemals NULL-Werte referenzieren, Fremdschlüssel hingegen schon',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Referentielle Integrität gilt nur für 1:1-Beziehungen',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-025',
    owner: 0,
    questiontext: 'Ordnen Sie jeden Begriff der passenden Definition zu.',
    questiontags: ['c-modellierung-generalisierung'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Zusammenfassung gleichartiger Objekttypen (Subtypen) zu einem Objekttyp (Supertyp)'
      },
      {
        id: 2,
        name: 'Zerlegung eines Objekttyps (Supertyp) in nachgeordnete Objekttypen (Subtypen) mit speziellen Merkmalen'
      },
      {
        id: 3,
        name: 'Zusammenfassung von Beziehungen zu einem Objekt höherer Ordnung'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Generalisierung',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Spezialisierung',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'Aggregation',
        correctAnswers: [3]
      }
    ]
  },
  {
    _id: 'q-026',
    owner: 0,
    questiontext:
      'Eine Klassifizierung von Teilmengen (Subtypen), die sowohl vollständig als auch disjunkt ist, wird auch bezeichnet als:',
    questiontags: ['c-modellierung-generalisierung'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Aggregation',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Partition',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Rekursion',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Assoziation',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-027',
    owner: 0,
    questiontext: 'Was ist eine Rekursion im Sinne der Datenmodellierung?',
    questiontags: ['c-modellierung-generalisierung'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Ein Beziehungstyp, der einen Entity-Typ mit sich selbst in Beziehung setzt',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Eine wiederholte Anwendung der Normalisierung auf dieselbe Tabelle',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Eine Beziehung zwischen genau drei unterschiedlichen Entity-Typen',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Die mehrfache Vererbung von Attributen in der Generalisierung',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-028',
    owner: 0,
    questiontext:
      "Bei einer rekursiven Beziehung (z.B. 'Teil setzt sich zusammen aus / geht ein in Struktur') sind zusätzlich zum Beziehungsnamen zwingend notwendig:",
    questiontags: ['c-modellierung-generalisierung'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Zwei unterschiedliche Primärschlüssel für denselben Entity-Typ',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Rollennamen der parallelen Kanten',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Ein zusätzlicher schwacher Entity-Typ',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Eine Min-Max-Notation von (1,1) auf beiden Seiten',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-029',
    owner: 0,
    questiontext:
      'Welche Gründe sprechen laut Vorlesung für eine explizite Spezifikation von Teilmengen (Generalisierung/Spezialisierung) einer Objektmenge?',
    questiontags: ['c-modellierung-generalisierung'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Teilmengen haben Sonderattribute, unterschiedliche Beziehungstypen oder unterschiedliche Verarbeitungsprozesse',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Ausschließlich um die Anzahl der Tabellen künstlich zu erhöhen',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Nur um Redundanz zu maximieren',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Nur wenn kein Primärschlüssel vorhanden ist',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-030',
    owner: 0,
    questiontext: 'Welche Aussage zum Strukturierten Entity-Relationship-Modell (SERM) trifft zu?',
    questiontags: ['c-modellierung-serm'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Im SERM verläuft jede Kante von rechts (Quelle) nach links (Senke)',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Im SERM verläuft eine Kante immer von links (Quelle) nach rechts (Senke), wobei die Quelle immer ein E- bzw. ER-Typ und die Senke immer ein ER- bzw. R-Typ ist',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Im SERM gibt es keine Rollennamen für parallele Kanten',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Im SERM werden Kardinalitäten nicht dargestellt',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-031',
    owner: 0,
    questiontext: 'Was ist ein zentrales Problem des klassischen ERM, das das SERM lösen soll?',
    questiontags: ['c-modellierung-serm'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Zu wenige Objekttypen und zu einfache Struktur',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Bei vielen Objekttypen wird das Modell unübersichtlich, unstrukturiert und Abhängigkeiten sind kaum sichtbar',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'ERM kann keine Attribute darstellen',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'ERM erlaubt keine Beziehungen zwischen Entitäten',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-032',
    owner: 0,
    questiontext: 'Welche zwei Vererbungsarten unterscheidet das SERM bei der Schlüsselvererbung?',
    questiontags: ['c-modellierung-serm'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Primary-Key-Vererbung und Foreign-Key-Vererbung',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Starke Vererbung und schwache Vererbung',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Einfachvererbung und Mehrfachvererbung',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Horizontale Vererbung und vertikale Vererbung',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-033',
    owner: 0,
    questiontext:
      'Im SERM wird ein Beziehungstyp, der als eigenständiger Objekttyp auftritt und selbst weitere Beziehungen eingehen kann, als ____-Typ bezeichnet.',
    questiontags: ['c-modellierung-serm'],
    questiontype: 'fill-in-the-blank',
    questionconfiguration: {},
    difficulty: 3,
    showBlanks: false,
    textParts: [
      {
        order: 0,
        text: 'Im SERM wird ein Beziehungstyp, der als eigenständiger Objekttyp auftritt und selbst weitere Beziehungen eingehen kann, als ',
        isBlank: false
      },
      {
        order: 1,
        text: 'ER',
        isBlank: true,
        acceptedAlternatives: ['ER-Typ', 'er']
      },
      {
        order: 2,
        text: '-Typ bezeichnet.',
        isBlank: false
      }
    ]
  },
  {
    _id: 'q-034',
    owner: 0,
    questiontext: 'Was ist der Unterschied zwischen einer Klasse und einem Objekt in der UML?',
    questiontags: ['c-modellierung-uml'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Eine Klasse ist eine Instanz eines Objekts',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Ein Objekt ist eine Instanz einer Klasse; die Klasse ist die Schablone/der Typ für die Objekte',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Klasse und Objekt sind in der UML identische Begriffe',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Ein Objekt kann mehrere Klassen gleichzeitig instanziieren',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-035',
    owner: 0,
    questiontext:
      "Welches UML-Diagramm zeigt eine 'Momentaufnahme' des Zustands eines Systems zu einem bestimmten Zeitpunkt?",
    questiontags: ['c-modellierung-uml'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Klassendiagramm',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Objektdiagramm',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Use-Case-Diagramm',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Sequenzdiagramm',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-036',
    owner: 0,
    questiontext: 'Was unterscheidet eine Komposition von einer Aggregation in der UML?',
    questiontags: ['c-modellierung-uml'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Bei der Komposition sind die Teile existenzabhängig vom Aggregat, bei der Aggregation nicht',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Bei der Aggregation sind die Teile existenzabhängig, bei der Komposition nicht',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Es gibt keinen inhaltlichen Unterschied, nur eine andere Notation',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Komposition beschreibt nur 1:1-Beziehungen, Aggregation nur m:n-Beziehungen',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-037',
    owner: 0,
    questiontext: 'Welche Aussage im Vergleich UML vs. ERM ist korrekt?',
    questiontags: ['c-modellierung-uml'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Das ERM kennt im Gegensatz zur UML eine explizite Objektebene',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Die UML kennt eine Leserichtung von Assoziationen, das ERM hingegen nicht',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Nur das ERM unterstützt Kardinalitäten, die UML nicht',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Vererbung existiert nur in der UML, Generalisierung/Spezialisierung nur im ERM als völlig andere Konzepte ohne Bezug',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-038',
    owner: 0,
    questiontext:
      "Bei der Vererbung in der UML unterscheidet man einfache und mehrfache Vererbung. Was bedeutet 'mehrfache Vererbung'?",
    questiontags: ['c-modellierung-uml'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Eine Klasse kann mehrere Oberklassen besitzen',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Eine Klasse kann beliebig viele Instanzen (Objekte) besitzen',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Eine Unterklasse kann nur eine einzige Instanz haben',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Mehrfachvererbung ist in der UML grundsätzlich verboten',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-039',
    owner: 0,
    questiontext:
      'Welches Datenmodell erzwingt, dass jeder Datensatz (außer der Wurzel) genau einen Vorgänger hat, sodass m:m-Beziehungen in 1:m-Beziehungen umgewandelt werden müssen?',
    questiontags: ['c-relationenmodell-datenmodelle'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Relationenmodell',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Hierarchisches Modell',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Netzwerkmodell',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Objektorientiertes Modell',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-040',
    owner: 0,
    questiontext:
      'Was ist der zentrale Vorteil des Netzwerkmodells gegenüber dem hierarchischen Modell?',
    questiontags: ['c-relationenmodell-datenmodelle'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Ein Datensatz kann mehr als einen Vorgänger haben, wodurch m:m-Beziehungen abbildbar sind',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Es benötigt keinerlei Zeiger oder Verknüpfungen zwischen Datensätzen',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Es wurde in der Praxis stärker verbreitet als das relationale Modell',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Manipulation und Auswertung sind deutlich weniger aufwendig als im hierarchischen Modell',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-041',
    owner: 0,
    questiontext:
      'Welches der folgenden Merkmale wird dem objektorientierten Datenmodell laut Vorlesung zugeschrieben?',
    questiontags: ['c-relationenmodell-datenmodelle'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Es hat sich seit über 20 Jahren nicht in der breiten Praxis durchgesetzt, u.a. wegen möglicher Query-Komplexität',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Es basiert zwingend auf atomaren Attributwerten, wie das Relationenmodell',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Es ist die Grundlage der meisten Datenbanksysteme bis in die 1980er Jahre',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Es kennt keine Vererbung',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-042',
    owner: 0,
    questiontext:
      'Eine Relation R ist eine ____ des kartesischen Produkts von Wertebereichen (W1, W2, ..., WN).',
    questiontags: ['c-relationenmodell-grundlagen'],
    questiontype: 'fill-in-the-blank',
    questionconfiguration: {},
    difficulty: 2,
    showBlanks: false,
    textParts: [
      {
        order: 0,
        text: 'Eine Relation R ist eine ',
        isBlank: false
      },
      {
        order: 1,
        text: 'Teilmenge',
        isBlank: true
      },
      {
        order: 2,
        text: ' des kartesischen Produkts von Wertebereichen (W1, W2, ..., WN).',
        isBlank: false
      }
    ]
  },
  {
    _id: 'q-043',
    owner: 0,
    questiontext: "Was versteht man unter dem 'Grad' einer Relation?",
    questiontags: ['c-relationenmodell-grundlagen'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Die Anzahl der Tupel (Zeilen) einer Relation',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Die Anzahl der Attribute (Spalten) einer Relation',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Die Anzahl der Schlüsselkandidaten',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Die Anzahl der referenzierenden Fremdschlüssel',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-044',
    owner: 0,
    questiontext:
      "Kreuzen Sie an, ob die Aussage über das Relationenmodell 'wahr' oder 'falsch' ist.",
    questiontags: ['c-relationenmodell-grundlagen'],
    questiontype: 'matrix',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'wahr'
      },
      {
        id: 2,
        name: 'falsch'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Die Reihenfolge der Spalten (Attribute) ist ohne Bedeutung',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Die Reihenfolge der Zeilen (Tupel) ist ohne Bedeutung',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Attributwerte dürfen mehrere Einzelwerte gleichzeitig enthalten',
        correctAnswers: [2]
      },
      {
        id: 4,
        text: 'Identische Tupel (Zeilen) dürfen nicht vorkommen',
        correctAnswers: [1]
      }
    ]
  },
  {
    _id: 'q-045',
    owner: 0,
    questiontext: 'Welcher Vorteil des Relationenmodells wird in der Vorlesung NICHT genannt?',
    questiontags: ['c-relationenmodell-grundlagen'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Einfachheit des Modells durch Mengenoperationen',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Geschlossene Systematik zur Gruppierung der Merkmale',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Garantierte Eliminierung jeglicher Rechenzeit bei komplexen Anfragen',
        correctAnswers: [1]
      },
      {
        id: 4,
        text: 'Darstellbarkeit und Übertragbarkeit auf vorhandene Datenbanksysteme',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-046',
    owner: 0,
    questiontext:
      "Wie wird ein einfacher Relationship-Typ (R-Typ) mit einer '1'-Kante bei der Transformation vom ERM ins Relationenmodell behandelt?",
    questiontags: ['c-relationenmodell-transformation'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Er wird immer als eigenständiger Relationstyp/eigenständige Tabelle realisiert',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Er wird in den Relationstyp des entsprechenden E-Typs integriert (kein eigener Relationstyp)',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Er wird ignoriert und nicht in das Relationenmodell übernommen',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Er wird immer in zwei separate Tabellen aufgeteilt',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-047',
    owner: 0,
    questiontext:
      'Wie werden komplexe R-Typen (Kardinalität m oder mc auf beiden Seiten) bei der Transformation vom ERM ins Relationenmodell behandelt?',
    questiontags: ['c-relationenmodell-transformation'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Sie werden ignoriert, da komplexe Beziehungen im Relationenmodell nicht abbildbar sind',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Für komplexe R-Typen wird immer ein eigenständiger Relationstyp gebildet',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Sie werden stets in den Relationstyp eines der beteiligten E-Typen integriert',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Sie werden nur dann als Tabelle abgebildet, wenn sie Attribute besitzen',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-048',
    owner: 0,
    questiontext:
      'Bei einer Generalisierung: Was erhalten die Subtypen bei der Transformation ins Relationenmodell?',
    questiontags: ['c-relationenmodell-transformation'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Einen komplett neuen, unabhängigen Primärschlüssel',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Den Primärschlüssel des Supertyps',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Keinen Primärschlüssel, da sie vom Supertyp abhängen',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Ausschließlich Fremdschlüssel ohne Primärschlüssel',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-049',
    owner: 0,
    questiontext: 'Kreuzen Sie für jede Anomalie die passende Beschreibung an.',
    questiontags: ['c-normalisierung-grundlagen'],
    questiontype: 'matrix',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Ein Wert muss wegen Redundanz an mehreren Stellen konsistent geändert werden'
      },
      {
        id: 2,
        name: 'Ein neuer Fakt kann nicht eingefügt werden, ohne unnötige/unbekannte Werte für andere Attribute anzugeben'
      },
      {
        id: 3,
        name: 'Beim Löschen eines Datensatzes gehen ungewollt weitere, eigentlich noch benötigte Informationen verloren'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Änderungsanomalie',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Einfügeanomalie',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'Löschanomalie',
        correctAnswers: [3]
      }
    ]
  },
  {
    _id: 'q-050',
    owner: 0,
    questiontext: 'Was ist ein Schlüsselkandidat?',
    questiontags: ['c-normalisierung-grundlagen'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Jedes beliebige Attribut einer Relation',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Ein Identifikator, dessen Attributkombination minimal ist (keine Teilmenge davon identifiziert bereits eindeutig)',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Der zur Identifikation explizit ausgewählte Primärschlüssel',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Ein aus einer anderen Relation geerbter Schlüssel',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-051',
    owner: 0,
    questiontext: 'Wie ist ein Fremdschlüssel (Foreign Key) definiert?',
    questiontags: ['c-normalisierung-grundlagen'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Ein zufällig gewählter Schlüsselkandidat innerhalb derselben Relation',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Der geerbte Primärschlüssel einer anderen Relation',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Ein Index zur Beschleunigung des Datenzugriffs ohne Eindeutigkeitsanforderung',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Ein Attribut, das niemals referenziert werden darf',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-052',
    owner: 0,
    questiontext:
      'Eine Relation R befindet sich genau dann in erster Normalform, wenn alle Attributwerte ____ sind.',
    questiontags: ['c-normalisierung-1nf'],
    questiontype: 'fill-in-the-blank',
    questionconfiguration: {},
    difficulty: 1,
    showBlanks: false,
    textParts: [
      {
        order: 0,
        text: 'Eine Relation R befindet sich genau dann in erster Normalform, wenn alle Attributwerte ',
        isBlank: false
      },
      {
        order: 1,
        text: 'atomar',
        isBlank: true
      },
      {
        order: 2,
        text: ' sind.',
        isBlank: false
      }
    ]
  },
  {
    _id: 'q-053',
    owner: 0,
    questiontext:
      "Eine Tabelle 'Mitarbeiter' enthält pro Zeile mehrere Werte im Feld 'Tätigkeit' (z.B. 'Marketing, Kommunikation'). Welche Normalform ist dadurch verletzt?",
    questiontags: ['c-normalisierung-1nf'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: '1. Normalform (1NF)',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: '2. Normalform (2NF)',
        correctAnswers: []
      },
      {
        id: 3,
        text: '3. Normalform (3NF)',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Boyce-Codd-Normalform (BCNF)',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-054',
    owner: 0,
    questiontext:
      'Um eine Relation in die 1NF zu überführen, in der ein Attribut mehrere Werte pro Tupel enthält, muss man laut Vorlesungsbeispiel typischerweise:',
    questiontags: ['c-normalisierung-1nf'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Das mehrwertige Attribut löschen',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Für jede Kombination der mehrwertigen Attribute eine eigene Zeile erzeugen (Aufsplitten in mehr Tupel)',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Alle Werte in einer einzigen Zelle durch Kommata trennen',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Die Tabelle vollständig löschen und neu modellieren',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-055',
    owner: 0,
    questiontext:
      'Y heißt funktional abhängig von X in R, wenn es in R keine zwei Tupel gibt, die im Wert zu X ____, aber nicht im Wert zu Y übereinstimmen.',
    questiontags: ['c-normalisierung-2nf'],
    questiontype: 'fill-in-the-blank',
    questionconfiguration: {},
    difficulty: 3,
    showBlanks: false,
    textParts: [
      {
        order: 0,
        text: 'Y heißt funktional abhängig von X in R, wenn es in R keine zwei Tupel gibt, die im Wert zu X ',
        isBlank: false
      },
      {
        order: 1,
        text: 'übereinstimmen',
        isBlank: true,
        acceptedAlternatives: ['übereinstimmen,']
      },
      {
        order: 2,
        text: ', aber nicht im Wert zu Y übereinstimmen.',
        isBlank: false
      }
    ]
  },
  {
    _id: 'q-056',
    owner: 0,
    questiontext: 'Eine Relation R befindet sich genau dann in zweiter Normalform (2NF), wenn:',
    questiontags: ['c-normalisierung-2nf'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'R in 1NF vorliegt und alle Nichtschlüsselattribute vollfunktional vom Primärschlüssel abhängig sind',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'R in 3NF vorliegt und keine transitiven Abhängigkeiten existieren',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Jede Determinante in R ein Schlüsselkandidat ist',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'R keinen zusammengesetzten Primärschlüssel besitzt',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-057',
    owner: 0,
    questiontext:
      'In einer Relation R(KNr, PNr, MNr) mit dem zusammengesetzten Schlüssel (KNr, PNr) hängt das Attribut MNr nur von PNr ab, nicht vom gesamten Schlüssel. Welches Problem liegt vor?',
    questiontags: ['c-normalisierung-2nf'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Verletzung der 1NF durch nicht-atomare Werte',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Verletzung der 2NF durch eine nicht vollfunktionale Abhängigkeit (partielle Abhängigkeit von einem Teil des Schlüssels)',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Verletzung der 4NF durch eine mehrwertige Abhängigkeit',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Kein Normalisierungsproblem, da MNr ein Fremdschlüssel ist',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-058',
    owner: 0,
    questiontext:
      'X bestimmt Y voll funktional, wenn X → Y gilt und X ____ ist, d.h. keine echte Teilmenge Z von X existiert, für die bereits Z → Y gilt.',
    questiontags: ['c-normalisierung-2nf'],
    questiontype: 'fill-in-the-blank',
    questionconfiguration: {},
    difficulty: 3,
    showBlanks: false,
    textParts: [
      {
        order: 0,
        text: 'X bestimmt Y voll funktional, wenn X → Y gilt und X ',
        isBlank: false
      },
      {
        order: 1,
        text: 'minimal',
        isBlank: true
      },
      {
        order: 2,
        text: ' ist, d.h. keine echte Teilmenge Z von X existiert, für die bereits Z → Y gilt.',
        isBlank: false
      }
    ]
  },
  {
    _id: 'q-059',
    owner: 0,
    questiontext: 'Eine Relation R befindet sich genau dann in dritter Normalform (3NF), wenn:',
    questiontags: ['c-normalisierung-3nf-bcnf'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'R in 1NF vorliegt und kein Nichtschlüsselattribut transitiv vom Primärschlüssel abhängt',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'R in 2NF vorliegt, aber mehrwertige Abhängigkeiten enthält',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'R in 1NF vorliegt und mindestens eine transitive Abhängigkeit besitzt',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Alle Attribute Teil des Primärschlüssels sind',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-060',
    owner: 0,
    questiontext:
      'Relation Abteilungen(ANr, AName, SNr, SName, Ort): ANr → SNr → SName, Ort. Welche Abhängigkeit liegt zwischen ANr und (SName, Ort) vor, und welche Normalform wird dadurch verletzt?',
    questiontags: ['c-normalisierung-3nf-bcnf'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Transitive Abhängigkeit; Verletzung der 3NF',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Vollfunktionale Abhängigkeit; keine Normalform verletzt',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Mehrwertige Abhängigkeit; Verletzung der 4NF',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Verbundabhängigkeit; Verletzung der 5NF',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-061',
    owner: 0,
    questiontext: 'Eine Relation befindet sich genau dann in Boyce-Codd-Normalform (BCNF), wenn:',
    questiontags: ['c-normalisierung-3nf-bcnf'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'R in 1NF vorliegt und jede Determinante in R auch Schlüsselkandidat ist',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'R überhaupt keine Determinanten enthält',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Jedes Attribut mindestens zweimal in R vorkommt',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'R zwingend mehr als drei Attribute besitzt',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-062',
    owner: 0,
    questiontext: "Was ist eine 'Determinante' im Sinne der Normalisierung?",
    questiontags: ['c-normalisierung-3nf-bcnf'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Jedes beliebige Nichtschlüsselattribut',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Eine Attributkombination X, die ein anderes Attribut Y voll funktional bestimmt (X ⇒ Y)',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Der längste Schlüsselkandidat einer Relation',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Ein Attribut, das niemals in einem Schlüssel vorkommen darf',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-063',
    owner: 0,
    questiontext: 'Eine Relation befindet sich genau dann in vierter Normalform (4NF), wenn:',
    questiontags: ['c-normalisierung-4nf-5nf'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'R in 1NF vorliegt und keine mehrwertigen Abhängigkeiten in R existieren',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'R in 3NF vorliegt und mindestens eine mehrwertige Abhängigkeit besitzt',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Jede Verbundabhängigkeit eine Folge der Schlüsselkandidaten ist',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'R keine Nichtschlüsselattribute enthält',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-064',
    owner: 0,
    questiontext:
      'Eine Relation MNr-Tätigkeit-Qualifikation enthält für jeden Mitarbeiter jede Kombination aus Tätigkeiten und Qualifikationen (unabhängig voneinander). Welches Problem liegt vor und welche Normalform wird dadurch adressiert?',
    questiontags: ['c-normalisierung-4nf-5nf'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Transitive Abhängigkeit; 3NF',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Mehrwertige Abhängigkeit zwischen zwei voneinander unabhängigen Attributmengen; 4NF',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Nicht-atomare Werte; 1NF',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Fehlender Primärschlüssel; keine Normalform anwendbar',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-065',
    owner: 0,
    questiontext: 'Eine Relation befindet sich in fünfter Normalform (5NF), wenn:',
    questiontags: ['c-normalisierung-4nf-5nf'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Jede Verbundabhängigkeit in R eine Folge der Schlüsselkandidaten in R ist',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'R nur aus genau einem Attribut besteht',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Alle mehrwertigen Abhängigkeiten explizit erhalten bleiben',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'R keine Fremdschlüssel besitzt',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-066',
    owner: 0,
    questiontext:
      'Ordnen Sie jede Regel der korrekten Wirkung beim Löschen/Ändern eines referenzierten Datensatzes zu.',
    questiontags: ['c-normalisierung-ri'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Die Operation wird zurückgewiesen, solange abhängige Datensätze bestehen'
      },
      {
        id: 2,
        name: 'Die Änderung/Löschung wird auf alle abhängigen Datensätze propagiert'
      },
      {
        id: 3,
        name: 'Die abhängigen Fremdschlüsselwerte werden auf NULL gesetzt'
      },
      {
        id: 4,
        name: 'Die abhängigen Fremdschlüsselwerte werden auf einen Standardwert gesetzt'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'RESTRICT',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'CASCADE',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'SET NULL',
        correctAnswers: [3]
      },
      {
        id: 4,
        text: 'SET DEFAULT',
        correctAnswers: [4]
      }
    ]
  },
  {
    _id: 'q-067',
    owner: 0,
    questiontext:
      "Was bewirkt die Regel 'NO ACTION' im Unterschied zu 'RESTRICT' bei referentieller Integrität?",
    questiontags: ['c-normalisierung-ri'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Sie führt die Operation zunächst aus und verifiziert die Fremdschlüsselbeziehungen erst am Ende (z.B. nach Ausführung aller Trigger)',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Sie verhält sich in jedem DBMS exakt identisch zu CASCADE',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Sie löscht sofort alle abhängigen Datensätze ohne Prüfung',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Sie ist nur für Primärschlüssel, niemals für Fremdschlüssel anwendbar',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-068',
    owner: 0,
    questiontext: "Zwei Relationen R und S sind 'vereinigungsverträglich', wenn:",
    questiontags: ['c-relationenalgebra-mengen'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Sie den gleichen Grad haben und jedem Attribut von R ein Attribut gleichen Datentyps in S zugeordnet werden kann',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Sie exakt die gleichen Attributnamen besitzen müssen',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Sie die gleiche Anzahl an Tupeln enthalten',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Mindestens ein gemeinsamer Primärschlüssel existiert',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-069',
    owner: 0,
    questiontext: 'Ordnen Sie jede Operation der korrekten mengentheoretischen Definition zu.',
    questiontags: ['c-relationenalgebra-mengen'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: '{t | t ∈ R oder t ∈ S}'
      },
      {
        id: 2,
        name: '{t | t ∈ R und t ∈ S}'
      },
      {
        id: 3,
        name: '{t | t ∈ R und t ∉ S}'
      },
      {
        id: 4,
        name: '{t | t ∈ R oder t ∈ S, und t ∉ (R ∩ S)}'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Vereinigung (R ∪ S)',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Durchschnitt (R ∩ S)',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'Differenz (R − S)',
        correctAnswers: [3]
      },
      {
        id: 4,
        text: 'Symmetrische Differenz (R/S)',
        correctAnswers: [4]
      }
    ]
  },
  {
    _id: 'q-070',
    owner: 0,
    questiontext:
      'Relation R (5 Tupel) und Relation S (3 Tupel) sind beliebigen Grades. Wie viele Tupel enthält das kartesische Produkt R × S?',
    questiontags: ['c-relationenalgebra-mengen'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: '8',
        correctAnswers: []
      },
      {
        id: 2,
        text: '15',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: '5',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Es kommt auf gemeinsame Attribute an',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-071',
    owner: 0,
    questiontext:
      'Was gilt für das kartesische Produkt zweier Relationen R und S bezüglich ihres Grades?',
    questiontags: ['c-relationenalgebra-mengen'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Der Grad von R × S ist die Summe der Grade von R und S',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Der Grad von R × S entspricht immer dem Grad von R',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'R und S müssen vereinigungsverträglich sein, damit R × S gebildet werden kann',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Der Grad von R × S ist das Produkt der Grade von R und S',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-072',
    owner: 0,
    questiontext:
      "Eine Datenbanksprache wird 'relational vollständig' genannt, wenn sie mindestens den ____ der relationalen Algebra umfasst.",
    questiontags: ['c-relationenalgebra-mengen'],
    questiontype: 'fill-in-the-blank',
    questionconfiguration: {},
    difficulty: 3,
    showBlanks: false,
    textParts: [
      {
        order: 0,
        text: "Eine Datenbanksprache wird 'relational vollständig' genannt, wenn sie mindestens den ",
        isBlank: false
      },
      {
        order: 1,
        text: 'Selektionsumfang',
        isBlank: true
      },
      {
        order: 2,
        text: ' der relationalen Algebra umfasst.',
        isBlank: false
      }
    ]
  },
  {
    _id: 'q-073',
    owner: 0,
    questiontext:
      'Welche Operation der Relationenalgebra entspricht der Auswahl bestimmter Spalten (Attribute) einer Relation?',
    questiontags: ['c-relationenalgebra-projektion-restriktion'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Restriktion (Selektion)',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Projektion',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Join',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Kartesisches Produkt',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-074',
    owner: 0,
    questiontext:
      'Welche Operation der Relationenalgebra entspricht der Auswahl bestimmter Zeilen (Tupel) anhand einer Bedingung?',
    questiontags: ['c-relationenalgebra-projektion-restriktion'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Projektion',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Restriktion / Selektion',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Vereinigung',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Verbund',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-075',
    owner: 0,
    questiontext:
      'Die Notation R[kW>=110] aus der Vorlesung (Restriktion der Relation KFZ-Typ) entspricht in SQL am ehesten welcher Klausel?',
    questiontags: ['c-relationenalgebra-projektion-restriktion'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'SELECT * FROM KFZ_Typ',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'SELECT * FROM KFZ_Typ WHERE kW >= 110',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'SELECT kW FROM KFZ_Typ',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'SELECT * FROM KFZ_Typ GROUP BY kW',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-076',
    owner: 0,
    questiontext: 'Ordnen Sie jede Join-Art der korrekten Beschreibung zu.',
    questiontags: ['c-relationenalgebra-join'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Verbund über gleichnamige Attribute; ohne gemeinsame Attribute entspricht das Ergebnis dem kartesischen Produkt'
      },
      {
        id: 2,
        name: 'Nur Tupel mit einer Entsprechung in beiden Relationen werden angezeigt'
      },
      {
        id: 3,
        name: 'Tupel aus R ohne Entsprechung in S werden mit NULL-Werten aufgefüllt und trotzdem angezeigt'
      },
      {
        id: 4,
        name: 'Nicht zugeordnete Tupel aus beiden Relationen werden mit NULL-Werten aufgefüllt und angezeigt'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Equi-Join / Inner Join',
        correctAnswers: [2]
      },
      {
        id: 2,
        text: 'Natural Join',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Left-Outer-Join',
        correctAnswers: [3]
      },
      {
        id: 4,
        text: 'Full-Outer-Join',
        correctAnswers: [4]
      }
    ]
  },
  {
    _id: 'q-077',
    owner: 0,
    questiontext:
      'Was passiert beim Natural Join, wenn zwei Relationen R und S KEINE gemeinsam benannten Attribute besitzen?',
    questiontags: ['c-relationenalgebra-join'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Der Join liefert eine leere Ergebnismenge',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Das Ergebnis entspricht dem kartesischen Produkt von R und S',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Es tritt ein Fehler auf, der Join kann nicht ausgeführt werden',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Es wird automatisch ein Left-Outer-Join durchgeführt',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-078',
    owner: 0,
    questiontext: "Welche Aussage zum 'Full-Outer-Join' laut Vorlesung ist korrekt?",
    questiontags: ['c-relationenalgebra-join'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Er wird in MySQL nativ direkt unterstützt',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Er zeigt nur Tupel, die auf beiden Seiten eine direkte Verbindung haben',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Er nimmt Tupel ohne Entsprechung aus BEIDEN Relationen mit NULL-Auffüllung in das Ergebnis auf; in MySQL nicht direkt verfügbar',
        correctAnswers: [1]
      },
      {
        id: 4,
        text: 'Er ist identisch zum kartesischen Produkt',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-079',
    owner: 0,
    questiontext:
      'Welche Relationenalgebra-Notation beschreibt den Equi-Join zweier Relationen R und S über Attributkombinationen a und c?',
    questiontags: ['c-relationenalgebra-join'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'R[a Θ c]',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'R[a = c]S',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'R ∪ S',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'R[a]',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-080',
    owner: 0,
    questiontext: 'Ordnen Sie jede Abkürzung der korrekten Aufgabe zu.',
    questiontags: ['c-sql-ddl', 'c-sql-views', 'c-sql-metadaten'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Definition der Datenbankstruktur'
      },
      {
        id: 2,
        name: 'Manipulation und Retrieval von Datensätzen'
      },
      {
        id: 3,
        name: 'Definition von Sichten auf die Daten'
      },
      {
        id: 4,
        name: 'Definition von Zugriffsrechten'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'DDL (Data Definition Language)',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'DML (Data Manipulation Language)',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'VDL (View Definition Language)',
        correctAnswers: [3]
      },
      {
        id: 4,
        text: 'DCL (Data Control Language)',
        correctAnswers: [4]
      }
    ]
  },
  {
    _id: 'q-081',
    owner: 0,
    questiontext: 'Welcher SQL-Befehl erstellt eine neue Tabelle?',
    questiontags: ['c-sql-ddl'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'ALTER TABLE',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'CREATE TABLE',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'INSERT INTO',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'DEFINE TABLE',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-082',
    owner: 0,
    questiontext:
      'Welcher Datentyp ist laut Vorlesung für eine Zeichenkette VARIABLER Länge vorgesehen?',
    questiontags: ['c-sql-ddl'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'CHAR(n)',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'VARCHAR(n)',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'INTEGER',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'DECIMAL(x,y)',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-083',
    owner: 0,
    questiontext: 'Welcher SQL-Befehl fügt einer bestehenden Tabelle eine neue Spalte hinzu?',
    questiontags: ['c-sql-ddl'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'ALTER TABLE <tabellenname> ADD COLUMN <spaltendefinition>;',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'CREATE COLUMN <spaltendefinition> ON <tabellenname>;',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'UPDATE TABLE <tabellenname> ADD <spaltendefinition>;',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'INSERT COLUMN <spaltendefinition> INTO <tabellenname>;',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-084',
    owner: 0,
    questiontext: '____ TABLE <tabellenname>;',
    questiontags: ['c-sql-ddl'],
    questiontype: 'fill-in-the-blank',
    questionconfiguration: {},
    difficulty: 1,
    showBlanks: false,
    textParts: [
      {
        order: 0,
        text: 'DROP',
        isBlank: true,
        acceptedAlternatives: ['drop']
      },
      {
        order: 1,
        text: ' TABLE <tabellenname>;',
        isBlank: false
      }
    ]
  },
  {
    _id: 'q-085',
    owner: 0,
    questiontext: 'Was ist beim Anlegen von Constraints in CREATE TABLE laut Vorlesung möglich?',
    questiontags: ['c-sql-ddl'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'PRIMARY KEY, FOREIGN KEY, CHECK und UNIQUE können jeweils als benannte CONSTRAINTs definiert werden',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Es kann pro Tabelle maximal ein einziges Constraint definiert werden',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'FOREIGN KEY-Constraints unterstützen keine ON DELETE/ON UPDATE-Regeln',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'CHECK-Constraints sind in SQL nicht vorgesehen',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-086',
    owner: 0,
    questiontext: 'Welcher SQL-Befehl fügt einen neuen Datensatz in eine Tabelle ein?',
    questiontags: ['c-sql-dml'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'ADD INTO <tabellenname> VALUES (...)',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'INSERT INTO <tabellenname> VALUES (...)',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'APPEND <tabellenname> (...)',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'NEW ROW <tabellenname> (...)',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-087',
    owner: 0,
    questiontext:
      'Beim Löschen von Datensätzen mit DELETE FROM <tabelle> ____ <bedingung>; wird festgelegt, welche Zeilen entfernt werden.',
    questiontags: ['c-sql-dml'],
    questiontype: 'fill-in-the-blank',
    questionconfiguration: {},
    difficulty: 1,
    showBlanks: false,
    textParts: [
      {
        order: 0,
        text: 'Beim Löschen von Datensätzen mit DELETE FROM <tabelle> ',
        isBlank: false
      },
      {
        order: 1,
        text: 'WHERE',
        isBlank: true,
        acceptedAlternatives: ['where']
      },
      {
        order: 2,
        text: ' <bedingung>; wird festgelegt, welche Zeilen entfernt werden.',
        isBlank: false
      }
    ]
  },
  {
    _id: 'q-088',
    owner: 0,
    questiontext: 'Welcher SQL-Befehl ändert bestehende Datensätze einer Tabelle?',
    questiontags: ['c-sql-dml'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'UPDATE <tabellenname> SET <spalte> = <wert> WHERE <bedingung>;',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'CHANGE <tabellenname> SET <spalte> = <wert>;',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'ALTER <tabellenname> SET <spalte> = <wert>;',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'MODIFY <tabellenname> VALUES (...);',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-089',
    owner: 0,
    questiontext:
      'Was passiert, wenn beim Löschen von Datensätzen abhängige Datensätze in anderen Tabellen existieren und referentielle Integrität mit ON DELETE CASCADE definiert wurde?',
    questiontags: ['c-sql-dml'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Der Löschvorgang wird immer verweigert',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Die abhängigen Datensätze werden ebenfalls (kaskadiert) gelöscht',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Es passiert nichts, referentielle Integrität wird ignoriert',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Nur der Primärschlüssel wird gelöscht, nicht der gesamte Datensatz',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-090',
    owner: 0,
    questiontext:
      'Welche Klausel im SELECT-Befehl entspricht der Projektion der Relationenalgebra?',
    questiontags: ['c-sql-select'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'FROM',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'WHERE',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'SELECT-Teil (Auswahl der Attribute)',
        correctAnswers: [1]
      },
      {
        id: 4,
        text: 'ORDER BY',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-091',
    owner: 0,
    questiontext:
      'Welche Klausel im SELECT-Befehl entspricht der Restriktion der Relationenalgebra?',
    questiontags: ['c-sql-select'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'WHERE',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'GROUP BY',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'SELECT',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'HAVING',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-092',
    owner: 0,
    questiontext:
      'Welche Aggregatfunktion liefert die Anzahl der Zeilen (Datensätze) eines Ergebnisses?',
    questiontags: ['c-sql-select'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'SUM',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'COUNT',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'AVG',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'MAX',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-093',
    owner: 0,
    questiontext:
      'Welche Regel gilt laut Vorlesung, wenn eine SELECT-Abfrage Aggregatfunktionen verwendet?',
    questiontags: ['c-sql-select'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Alle Attribute im SELECT-Teil, die nicht in der Aggregatfunktion verwendet werden, müssen in der GROUP BY-Klausel stehen',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'GROUP BY ist bei Verwendung von Aggregatfunktionen niemals erforderlich',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Aggregatfunktionen dürfen nur einmal pro Datenbank verwendet werden',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'HAVING ersetzt in diesem Fall die WHERE-Klausel vollständig',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-094',
    owner: 0,
    questiontext: 'Was ist der Unterschied zwischen WHERE und HAVING in einer SQL-Abfrage?',
    questiontags: ['c-sql-select'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'WHERE filtert einzelne Zeilen vor der Gruppierung, HAVING filtert Gruppen nach der Gruppierung (z.B. auf Basis von Aggregatfunktionen)',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'WHERE und HAVING sind vollkommen identisch und austauschbar',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'HAVING kann nur ohne GROUP BY verwendet werden',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'WHERE darf keine Vergleichsoperatoren enthalten',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-095',
    owner: 0,
    questiontext:
      'Um in einer LIKE-Bedingung eine beliebige Zeichenfolge zu ersetzen, verwendet man das Zeichen ____.',
    questiontags: ['c-sql-select'],
    questiontype: 'fill-in-the-blank',
    questionconfiguration: {},
    difficulty: 2,
    showBlanks: false,
    textParts: [
      {
        order: 0,
        text: 'Um in einer LIKE-Bedingung eine beliebige Zeichenfolge zu ersetzen, verwendet man das Zeichen ',
        isBlank: false
      },
      {
        order: 1,
        text: '%',
        isBlank: true
      },
      {
        order: 2,
        text: '.',
        isBlank: false
      }
    ]
  },
  {
    _id: 'q-096',
    owner: 0,
    questiontext: "Welcher Ausdruck liefert alle Orte, die mit dem Buchstaben 'D' beginnen?",
    questiontags: ['c-sql-select'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: "WHERE ort = 'D%'",
        correctAnswers: []
      },
      {
        id: 2,
        text: "WHERE ort LIKE 'D%'",
        correctAnswers: [1]
      },
      {
        id: 3,
        text: "WHERE ort LIKE '%D'",
        correctAnswers: []
      },
      {
        id: 4,
        text: "WHERE ort IN 'D'",
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-097',
    owner: 0,
    questiontext: 'Was bewirkt DISTINCT im SELECT-Teil einer Abfrage?',
    questiontags: ['c-sql-select'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Es sortiert die Ergebnisse absteigend',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Es unterdrückt doppelte (identische) Ergebniszeilen',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Es gruppiert automatisch nach dem ersten Attribut',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Es schließt NULL-Werte grundsätzlich aus',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-098',
    owner: 0,
    questiontext:
      'Welche der folgenden Join-Varianten liefert auch die Gäste (linke Tabelle) OHNE zugehörige Reservierung (rechte Tabelle), wobei fehlende Werte mit NULL aufgefüllt werden?',
    questiontags: ['c-sql-select'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'INNER JOIN',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'LEFT JOIN',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'NATURAL JOIN mit WHERE-Bedingung',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'SELFJOIN',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-099',
    owner: 0,
    questiontext: 'Was ist ein SELFJOIN?',
    questiontags: ['c-sql-select'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Ein Join, bei dem eine Tabelle mit sich selbst (unter zwei Aliassen) verknüpft wird',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Ein Join zwischen genau drei unterschiedlichen Tabellen',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Ein Join, der automatisch alle NULL-Werte entfernt',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Ein spezieller Join nur für Views',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-100',
    owner: 0,
    questiontext:
      'Um zu prüfen, ob ein Wert NICHT in einer Ergebnismenge einer anderen Abfrage enthalten ist, verwendet man den Operator NOT ____.',
    questiontags: ['c-sql-select'],
    questiontype: 'fill-in-the-blank',
    questionconfiguration: {},
    difficulty: 2,
    showBlanks: false,
    textParts: [
      {
        order: 0,
        text: 'Um zu prüfen, ob ein Wert NICHT in einer Ergebnismenge einer anderen Abfrage enthalten ist, verwendet man den Operator NOT ',
        isBlank: false
      },
      {
        order: 1,
        text: 'IN',
        isBlank: true,
        acceptedAlternatives: ['in']
      },
      {
        order: 2,
        text: '.',
        isBlank: false
      }
    ]
  },
  {
    _id: 'q-101',
    owner: 0,
    questiontext: "Was ist eine 'View' (Sicht) laut Vorlesung?",
    questiontags: ['c-sql-views'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Eine virtuelle Tabelle ohne eigene Datensätze, deren Datenretrieval wie bei einer normalen Tabelle funktioniert',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Eine physisch dauerhaft gespeicherte Kopie einer Tabelle',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Ein Synonym für einen Primärschlüssel',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Ein Backup-Mechanismus für gelöschte Datensätze',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-102',
    owner: 0,
    questiontext: 'Welcher Zweck wird für Views in der Vorlesung NICHT genannt?',
    questiontags: ['c-sql-views'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Gezielte Denormalisierung zur Datenaufbereitung',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Zugriffssteuerung',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Vereinfachung komplexer Abfragen / Zwischenspeicherung von Zwischenergebnissen',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Physische Verdopplung der Rohdaten zur Erhöhung der Ausfallsicherheit',
        correctAnswers: [1]
      }
    ]
  },
  {
    _id: 'q-103',
    owner: 0,
    questiontext: 'Mit welchem SQL-Statement wird eine Sicht erstellt?',
    questiontags: ['c-sql-views'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'CREATE VIEW <viewname> AS <select befehl>;',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'NEW VIEW <viewname> FROM <select befehl>;',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'DEFINE VIEW <viewname> USING <select befehl>;',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'MAKE VIEW <viewname> (<select befehl>);',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-104',
    owner: 0,
    questiontext: 'Welcher Vorteil wird für Stored Procedures/Functions in der Vorlesung genannt?',
    questiontags: ['c-sql-stored-procedures'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Reduktion des Netzwerkverkehrs und Erhöhung der Sicherheit durch Vermeidung direkter Tabellenzugriffe',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Sie sind von allen DBMS auf identische Weise implementiert',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Sie ersetzen vollständig die Notwendigkeit von Primärschlüsseln',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Sie funktionieren ausschließlich ohne Parameter',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-105',
    owner: 0,
    questiontext: 'Ordnen Sie jeden Parametertyp der korrekten Bedeutung zu.',
    questiontags: ['c-sql-stored-procedures'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Ausschließlich Eingabeparameter'
      },
      {
        id: 2,
        name: 'Ausschließlich Ausgabeparameter'
      },
      {
        id: 3,
        name: 'Sowohl Eingabe- als auch Ausgabeparameter'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'IN',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'OUT',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'INOUT',
        correctAnswers: [3]
      }
    ]
  },
  {
    _id: 'q-106',
    owner: 0,
    questiontext:
      'Warum wird bei Stored Procedures in MySQL/MariaDB oft mit DELIMITER // gearbeitet?',
    questiontags: ['c-sql-stored-procedures'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Weil das Standard-Trennzeichen Semikolon sowohl für einzelne SQL-Befehle als auch innerhalb der Prozedur verwendet wird und dies zu Konflikten führen würde',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Weil MySQL grundsätzlich kein Semikolon unterstützt',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Weil DELIMITER die Groß-/Kleinschreibung von Bezeichnern festlegt',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Weil DELIMITER die maximale Anzahl an Parametern begrenzt',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-107',
    owner: 0,
    questiontext: 'Wozu dient ein CURSOR innerhalb einer Stored Procedure?',
    questiontags: ['c-sql-stored-procedures'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Um mehrere von einem SELECT zurückgegebene Datensätze nacheinander (zeilenweise) auszulesen',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Um die Position des Mauszeigers in der Datenbank-Oberfläche zu speichern',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Um automatisch Indizes anzulegen',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Um Trigger zu deaktivieren',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-108',
    owner: 0,
    questiontext: 'Was ist ein Trigger?',
    questiontags: ['c-sql-trigger'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Eine spezielle Stored Procedure, die durch bestimmte Datenbankoperationen/Ereignisse automatisch ausgelöst wird',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Ein manuell auszuführender SQL-Befehl ohne Bezug zu Ereignissen',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Ein Synonym für eine View',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Ein Index auf einer Spalte',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-109',
    owner: 0,
    questiontext: 'In einem AFTER-INSERT-Trigger: Welcher Wert ist verfügbar?',
    questiontags: ['c-sql-trigger'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Nur OLD, da der neue Wert noch nicht existiert',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Nur NEW, da beim Einfügen kein alter Wert existiert',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Weder OLD noch NEW sind bei INSERT jemals verfügbar',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Sowohl OLD als auch NEW sind identisch verfügbar',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-110',
    owner: 0,
    questiontext: 'Welche zwei Zeitpunkte der Ausführung unterscheidet man bei Triggern?',
    questiontags: ['c-sql-trigger'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'BEFORE und AFTER',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'START und END',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'PRE und POST',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'OLD und NEW',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-111',
    owner: 0,
    questiontext: 'Welcher Nutzen wird Triggern in der Vorlesung zugeschrieben?',
    questiontags: ['c-sql-trigger'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Umsetzung von Business Rules und komplexeren Konsistenzregeln direkt in der Datenbank, statt im Anwendungsprogramm',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Sie ersetzen vollständig die referentielle Integrität',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Sie können nur bei SELECT-Anweisungen ausgelöst werden',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Sie vereinfachen ausschließlich das Anlegen neuer Datenbanken',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-112',
    owner: 0,
    questiontext: 'Was versteht man unter Metadaten (Data Dictionary) einer Datenbank?',
    questiontags: ['c-sql-metadaten'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Informationen über die Struktur der Datenbank sowie der darin enthaltenen Daten (z.B. Tabellen, Attribute, Constraints)',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Die eigentlichen Nutzdaten der Anwendung',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Ausschließlich Backup-Dateien der Datenbank',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Nur die Benutzerpasswörter der Datenbank',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-113',
    owner: 0,
    questiontext: 'In MySQL befinden sich die Katalogtabellen mit Metadaten im Schema ____.',
    questiontags: ['c-sql-metadaten'],
    questiontype: 'fill-in-the-blank',
    questionconfiguration: {},
    difficulty: 3,
    showBlanks: false,
    textParts: [
      {
        order: 0,
        text: 'In MySQL befinden sich die Katalogtabellen mit Metadaten im Schema ',
        isBlank: false
      },
      {
        order: 1,
        text: 'information_schema',
        isBlank: true
      },
      {
        order: 2,
        text: '.',
        isBlank: false
      }
    ]
  },
  {
    _id: 'q-114',
    owner: 0,
    questiontext:
      'Welcher SQL-Befehl wird verwendet, um einem Benutzer Zugriffsrechte auf ein Datenbankobjekt zu erteilen?',
    questiontags: ['c-sql-metadaten'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'GRANT',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'ALLOW',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'PERMIT',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'ENABLE',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-115',
    owner: 0,
    questiontext: 'Wie ist eine Transaktion in der Vorlesung definiert?',
    questiontags: ['c-transaktionen-grundlagen'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Eine Folge zusammenhängender DB-Operationen, bei deren Ausführung auf einer konsistenten DB die Konsistenz der DB erhalten bleibt',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Jeder beliebige einzelne SELECT-Befehl',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Eine dauerhafte physische Kopie der gesamten Datenbank',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Ein Synonym für einen Trigger',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-116',
    owner: 0,
    questiontext: 'Ordnen Sie jede ACID-Eigenschaft ihrer Beschreibung zu.',
    questiontags: ['c-transaktionen-grundlagen'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: "Transaktionen werden vollständig oder gar nicht ausgeführt ('Alles-oder-Nichts')"
      },
      {
        id: 2,
        name: 'Transaktionen erhalten die Konsistenz der Datenbank'
      },
      {
        id: 3,
        name: 'Das Ergebnis einer Transaktion wird nicht durch parallel ablaufende Transaktionen beeinflusst'
      },
      {
        id: 4,
        name: 'Die Wirkung einer abgeschlossenen Transaktion ist dauerhaft (bleibt auch nach Systemfehlern erhalten)'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Atomicity (Atomarität)',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Consistency (Konsistenz)',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'Isolation',
        correctAnswers: [3]
      },
      {
        id: 4,
        text: 'Durability (Dauerhaftigkeit)',
        correctAnswers: [4]
      }
    ]
  },
  {
    _id: 'q-117',
    owner: 0,
    questiontext:
      'Womit wird eine Transaktion in SQL erfolgreich abgeschlossen, sodass die Änderungen dauerhaft in die Datenbank übernommen werden?',
    questiontags: ['c-transaktionen-grundlagen'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'COMMIT',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'ROLLBACK',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'SAVE',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'FINISH',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-118',
    owner: 0,
    questiontext:
      'Eine Transaktion überführt eine Datenbank von einem konsistenten Zustand in einen ____ konsistenten Zustand.',
    questiontags: ['c-transaktionen-grundlagen'],
    questiontype: 'fill-in-the-blank',
    questionconfiguration: {},
    difficulty: 2,
    showBlanks: false,
    textParts: [
      {
        order: 0,
        text: 'Eine Transaktion überführt eine Datenbank von einem konsistenten Zustand in einen ',
        isBlank: false
      },
      {
        order: 1,
        text: 'anderen',
        isBlank: true,
        acceptedAlternatives: ['anderen,']
      },
      {
        order: 2,
        text: ' konsistenten Zustand.',
        isBlank: false
      }
    ]
  },
  {
    _id: 'q-119',
    owner: 0,
    questiontext: 'Ordnen Sie jedes Problem der passenden Beschreibung zu.',
    questiontags: ['c-transaktionen-probleme'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Eine Transaktion überschreibt den von einer anderen Transaktion aktualisierten Wert wieder'
      },
      {
        id: 2,
        name: 'Eine Transaktion liest einen Wert, der von einer anderen (noch nicht committeten) Transaktion geändert wurde und später zurückgerollt wird'
      },
      {
        id: 3,
        name: 'Mehrfaches Auslesen desselben Datensatzes innerhalb einer Transaktion liefert unterschiedliche Ergebnisse'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Lost Update',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Dirty Read',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'Non-Repeatable Read',
        correctAnswers: [3]
      }
    ]
  },
  {
    _id: 'q-120',
    owner: 0,
    questiontext:
      'Transaktion A liest einen Depotbestand von 1000 Aktien, verkauft 200 und speichert 800. Parallel liest Transaktion B ebenfalls 1000, verkauft 500 und speichert 500 - überschreibt damit die Änderung von A. Welches Problem liegt vor?',
    questiontags: ['c-transaktionen-probleme'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Lost Update',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Dirty Read',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Deadlock',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Phantom Read im engeren Sinne',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-121',
    owner: 0,
    questiontext:
      "Wann gilt ein System paralleler Transaktionen als 'serialisierbar' und damit korrekt synchronisiert?",
    questiontags: ['c-transaktionen-probleme'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Wenn es eine serielle Ausführungsreihenfolge gibt, die denselben Datenbankzustand erzeugt wie die parallele Ausführung',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Wenn alle Transaktionen exakt gleichzeitig starten',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Wenn keine Transaktion jemals ein COMMIT ausführt',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Wenn der Präzedenzgraph mindestens einen Zyklus enthält',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-122',
    owner: 0,
    questiontext: 'Welches Serialisierungskriterium wird anhand des Präzedenzgraphen geprüft?',
    questiontags: ['c-transaktionen-probleme'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Der Präzedenzgraph darf keine Zyklen enthalten',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Der Präzedenzgraph muss mindestens einen Zyklus enthalten',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Der Präzedenzgraph muss vollständig unzusammenhängend sein',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Der Präzedenzgraph darf keine Knoten enthalten',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-123',
    owner: 0,
    questiontext:
      'Kreuzen Sie an, ob die Eigenschaft zum optimistischen oder zum pessimistischen (Sperr-)Verfahren gehört.',
    questiontags: ['c-transaktionen-sperrverfahren'],
    questiontype: 'matrix',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Optimistisches Verfahren'
      },
      {
        id: 2,
        name: 'Pessimistisches Verfahren (Sperrverfahren)'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: "Arbeitet auf 'Kopien' der Daten und validiert erst am Ende der Transaktion",
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Setzt Exklusivität für Datenbereiche mittels Sperrprotokoll voraus',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'Geht davon aus, dass Konflikte zwischen Transaktionen selten vorkommen',
        correctAnswers: [1]
      }
    ]
  },
  {
    _id: 'q-124',
    owner: 0,
    questiontext: 'Ordnen Sie jeden Sperrmodus seiner Bedeutung zu.',
    questiontags: ['c-transaktionen-sperrverfahren'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Mehrere Transaktionen dürfen gleichzeitig lesend zugreifen'
      },
      {
        id: 2,
        name: 'Nur eine Transaktion darf exklusiv auf den Bereich zugreifen (schreiben)'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Lesesperre (Shared Lock)',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Schreibsperre (Exclusive Lock)',
        correctAnswers: [2]
      }
    ]
  },
  {
    _id: 'q-125',
    owner: 0,
    questiontext: 'Welche der folgenden Regeln gehört NICHT zum Zweiphasen-Sperrprotokoll?',
    questiontags: ['c-transaktionen-sperrverfahren'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Jeder Bereich, auf den eine Transaktion zugreift, muss gesperrt werden',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Es ist die zulässige, am wenigsten einschränkende Sperrart zu wählen',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Eine Sperre darf erst freigegeben werden, wenn keine weiteren Sperren mehr gesetzt werden müssen (keine Vermischung von Sperren und Freigeben)',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Sperren dürfen jederzeit während der gesamten Transaktion beliebig oft freigegeben und neu gesetzt werden',
        correctAnswers: [1]
      }
    ]
  },
  {
    _id: 'q-126',
    owner: 0,
    questiontext: 'Was ist ein Deadlock?',
    questiontags: ['c-transaktionen-sperrverfahren'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Eine Situation, in der parallel ausgeführte Transaktionen wechselseitig auf das Aufheben gesetzter Sperren warten und den Wartezustand nicht selbst auflösen können',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Der geplante, kontrollierte Abbruch einer Transaktion durch ROLLBACK',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Ein Synonym für Lost Update',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Das erfolgreiche gleichzeitige COMMIT zweier Transaktionen',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-127',
    owner: 0,
    questiontext:
      'Welche zwei grundsätzlichen Lösungsstrategien für Deadlocks werden in der Vorlesung genannt?',
    questiontags: ['c-transaktionen-sperrverfahren'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Vermeidung sowie Entdeckung und Behebung',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Löschen und Neuanlegen der Datenbank',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Ignorieren und Protokollieren',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Erhöhung der Netzwerkbandbreite',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-128',
    owner: 0,
    questiontext: "Was ist 'Preclaiming' im Kontext von Sperrverfahren?",
    questiontags: ['c-transaktionen-sperrverfahren'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Das Setzen aller benötigten Sperren einer Transaktion bereits zu Beginn, bevor die erste Operation ausgeführt wird',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Das sofortige Löschen aller Sperren nach der ersten Operation',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Ein Synonym für COMMIT',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Das Verbot, überhaupt Sperren zu setzen',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-129',
    owner: 0,
    questiontext: 'Was wird in einem Logfile typischerweise protokolliert?',
    questiontags: ['c-transaktionen-recovery'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Transaction ID, Begin/End of Transaction, Before- und After-Images der geänderten Objekte',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Ausschließlich die Namen der beteiligten Datenbankbenutzer',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Nur die finalen, committeten Endzustände ohne Zwischenwerte',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Nur fehlerhafte SQL-Anfragen',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-130',
    owner: 0,
    questiontext: 'Ordnen Sie jeden Mechanismus dem passenden Fehlertyp zu.',
    questiontags: ['c-transaktionen-recovery'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Behebung von Transaktionsfehlern (Basis: Logdatei/Update-Kopien)'
      },
      {
        id: 2,
        name: 'Behebung von Betriebssystem- oder DBMS-Fehlern (Basis: Logfile mit Checkpoints)'
      },
      {
        id: 3,
        name: 'Behebung von Speicherfehlern/Plattenfehlern (Basis: Dump und Logfile)'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Rollback',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Restart',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'Rekonstruktion',
        correctAnswers: [3]
      }
    ]
  },
  {
    _id: 'q-131',
    owner: 0,
    questiontext: 'Wozu dient ein Checkpoint bei der Transaktionsverarbeitung?',
    questiontags: ['c-transaktionen-recovery'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Zur Übernahme aller abgeschlossenen, aber noch nicht physisch übernommenen Transaktionen vom Cache in die Datenbank, mit Vermerk im Logfile',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Zum dauerhaften Löschen aller bisherigen Transaktionsprotokolle',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Zum Setzen einer permanenten Exklusivsperre auf die gesamte Datenbank',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Zur Deaktivierung des ACID-Prinzips für Wartungsarbeiten',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-132',
    owner: 0,
    questiontext:
      'Welche Aussage zur Reihenfolge beim Schreiben in einem transaktionalen System ist korrekt?',
    questiontags: ['c-transaktionen-recovery'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Erst wird die Datenbank direkt geändert, danach erst das Logfile geschrieben',
        correctAnswers: []
      },
      {
        id: 2,
        text: 'Erst wird das Logfile beschrieben, dann wird die eigentliche DB-Änderung durchgeführt',
        correctAnswers: [1]
      },
      {
        id: 3,
        text: 'Logfile und DB-Änderung erfolgen niemals in einer definierten Reihenfolge',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Ein Logfile wird nur bei Systemabsturz nachträglich erzeugt',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-133',
    owner: 0,
    questiontext: 'Ordnen Sie jede Phase dem korrekten Ergebnis zu.',
    questiontags: ['c-entwicklung-vorgehensmodell'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Fachkonzept (datenbankunabhängiger Entwurf, z.B. ERM, SERM, UML)'
      },
      {
        id: 2,
        name: 'DV-Konzept (datenbankabhängiger Entwurf, z.B. Normalisierung im Relationenmodell)'
      },
      {
        id: 3,
        name: 'Konkrete technische Umsetzung inkl. Zugriffsrechten und Speicherparametern'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Semantische Modellierung',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Logischer Datenbankentwurf',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'Implementierung',
        correctAnswers: [3]
      }
    ]
  },
  {
    _id: 'q-134',
    owner: 0,
    questiontext:
      "Welche Eigenschaft trifft auf das 'klassische Vorgehensmodell' der Datenbankentwicklung zu?",
    questiontags: ['c-entwicklung-vorgehensmodell'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Es ist sequentiell: Eine Phase muss vollständig abgeschlossen sein, bevor die nächste beginnt',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Alle Phasen laufen zwingend parallel und unabhängig voneinander ab',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Es kennt keine Meilensteine oder Entwicklungsergebnisse',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Es ist identisch mit einem rein agilen Vorgehensmodell',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-135',
    owner: 0,
    questiontext:
      'Welche Anforderungsarten werden in der Anforderungsanalyse laut Vorlesung unterschieden?',
    questiontags: ['c-entwicklung-vorgehensmodell'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Statische Anforderungen (Datenstruktur) und dynamische Anforderungen (Operationen, Zugriffshäufigkeit etc.)',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Nur finanzielle und nur technische Anforderungen',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Nur interne und nur externe Anforderungen',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Anforderungen werden in dieser Phase nicht unterschieden',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-136',
    owner: 0,
    questiontext: 'Ordnen Sie jeden Begriff der passenden Definition zu.',
    questiontags: ['c-entwicklung-lastenpflichtenheft'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Spezifikation der Anforderungen an das zu realisierende System durch den Auftraggeber'
      },
      {
        id: 2,
        name: 'Detaillierte Dokumentation, wie der Auftragnehmer die Anforderungen aus dem Lastenheft konkret erfüllt'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Lastenheft',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Pflichtenheft',
        correctAnswers: [2]
      }
    ]
  },
  {
    _id: 'q-137',
    owner: 0,
    questiontext: 'Worauf basiert das Pflichtenheft?',
    questiontags: ['c-entwicklung-lastenpflichtenheft'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 1,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Auf dem Lastenheft',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Auf dem fertigen, bereits produktiven System',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Auf einer zufälligen Auswahl von Anforderungen ohne Bezug zum Auftraggeber',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Ausschließlich auf gesetzlichen Vorgaben, unabhängig vom Projekt',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-138',
    owner: 0,
    questiontext: 'Welcher Zweck wird für Lasten- und Pflichtenheft in der Vorlesung genannt?',
    questiontags: ['c-entwicklung-lastenpflichtenheft'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Ein für beide Seiten verständliches Projektprofil, Vorbeugung von Missverständnissen, Zeit- und Kostenersparnis',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Ausschließlich die rechtliche Absicherung des Auftragnehmers',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Die vollständige Ersetzung jeglicher Projektkommunikation',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Nur die Festlegung des Endpreises ohne inhaltliche Beschreibung',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-139',
    owner: 0,
    questiontext:
      'Ordnen Sie jede Organisationsform der passenden Beschreibung der Projektleiter-Kompetenzen zu.',
    questiontags: ['c-entwicklung-projektorganisation'],
    questiontype: 'matching',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Der Projektleiter hat nur beratende/koordinierende Funktion, keine Weisungsbefugnis; die Linienhierarchie bleibt unverändert'
      },
      {
        id: 2,
        name: 'Der Projektleiter hat volle Kompetenzen über Mitarbeiter, Budget und Betriebsmittel; Mitarbeiter sind meist vollzeit freigestellt'
      },
      {
        id: 3,
        name: 'Kombination aus Stabs- und reiner Projektorganisation; Mitarbeiter unterstehen fachlich dem PL, disziplinarisch dem Linienvorgesetzten'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Stabs-Projektorganisation',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Reine Projektorganisation',
        correctAnswers: [2]
      },
      {
        id: 3,
        text: 'Matrix-Projektorganisation',
        correctAnswers: [3]
      }
    ]
  },
  {
    _id: 'q-140',
    owner: 0,
    questiontext:
      "Für welche Projektsituation eignet sich laut Vorlesung die 'reine Projektorganisation' besonders?",
    questiontags: ['c-entwicklung-projektorganisation'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Für umfangreiche, sehr wichtige und dringende Projekte mit klar definierten Zielen, die eine Freistellung von Mitarbeitern rechtfertigen',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Für Projekte, die das Unternehmen nur punktuell betreffen und keine Mitarbeiterfreistellung erfordern',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Nur für sehr kleine, unwichtige Projekte ohne klare Zieldefinition',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Ausschließlich für Projekte ohne Projektleiter',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-141',
    owner: 0,
    questiontext:
      "Welche Rolle beschreibt am besten den 'Lenkungsausschuss' in einem Datenbankprojekt?",
    questiontags: ['c-entwicklung-projektorganisation'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 2,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Die oberste Instanz des Projekts, bestehend aus Entscheidungsträgern aller beteiligten Bereiche, zuständig für Weichenstellungen',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Die Person, die operativ den Programmcode schreibt',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Ein rein extern hinzugezogener, unbeteiligter Prüfer ohne Entscheidungsbefugnis',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Ein Synonym für den Auftraggeber',
        correctAnswers: []
      }
    ]
  },
  {
    _id: 'q-142',
    owner: 0,
    questiontext:
      "Was beschreibt die 'semantische Lücke' bei der Einbindung von Datenbanken in bestehende Systeme?",
    questiontags: ['c-entwicklung-vorgehensmodell'],
    questiontype: 'single-choice',
    questionconfiguration: {},
    difficulty: 3,
    multipleRow: false,
    multipleColumn: false,
    answerColumns: [
      {
        id: 1,
        name: 'Richtig'
      }
    ],
    optionRows: [
      {
        id: 1,
        text: 'Unterschiedliche Typsysteme und Auswertungsstrategien zwischen Datenbank (mengenorientiert) und Programmiersprache (satzorientiert), was zu verlustbehafteten Umwandlungen führen kann',
        correctAnswers: [1]
      },
      {
        id: 2,
        text: 'Das vollständige Fehlen einer grafischen Benutzeroberfläche',
        correctAnswers: []
      },
      {
        id: 3,
        text: 'Die räumliche Distanz zwischen Entwicklungsteam und Endnutzer',
        correctAnswers: []
      },
      {
        id: 4,
        text: 'Fehlende Netzwerkverbindung zwischen Client und Server',
        correctAnswers: []
      }
    ]
  }
]
