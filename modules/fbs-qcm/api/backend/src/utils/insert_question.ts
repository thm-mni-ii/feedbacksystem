
import * as mongoDB from 'mongodb';
import { connect } from '../mongo/mongo';

export async function insertQuestions() {
    try {
        // Connect to MongoDB
        
        const db: mongoDB.Db = await connect();
        const questionInCatalogCollection = db.collection('question');
        
        // Insert documents
        const results = [];

        const result0 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f42fd93fb13cd308e809"),
    owner: 1,
    questiontext: "Was beschreibt den Unterschied zwischen „Daten“, „Informationen“ und „Wissen“ am besten?",
    questiontags: [
        "Datenbanken"
    ],
    questiontype: "Choice",
    questionconfiguration: {
        multipleRow: false,
        multipleColumn: false,
        answerColumns: [
            {
                id: 1,
                name: ""
            }
        ],
        optionRows: [
            {
                id: 1,
                text: "Daten sind interpretierte Informationen, Wissen ist unstrukturierte Information",
                correctAnswers: []
            },
            {
                id: 2,
                text: "Daten sind rohe Werte, Informationen haben Kontext, Wissen ist interpretierte Information",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 3,
                text: "Informationen entstehen durch Erfahrung, Wissen durch Analyse von Informationen",
                correctAnswers: []
            },
            {
                id: 4,
                text: "Daten und Informationen sind gleichbedeutend, Wissen ist nur ein abstrakter Begriff",
                correctAnswers: []
            }
        ]
    },
    createdAt: new Date("2025-04-10T16:39:11.784Z"),
    lastEdited: new Date("2025-04-10T16:39:11.784Z")
});
        console.log(`Document inserted with id: ${result0.insertedId}`);
        results.push(result0);

        const result1 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f486d93fb13cd308e80a"),
    owner: 1,
    questiontext: "Ordne den Begriffen das richtige Beispiel zu:",
    questiontags: [
        "Datenbanken"
    ],
    questiontype: "Choice",
    questionconfiguration: {
        multipleRow: true,
        multipleColumn: true,
        answerColumns: [
            {
                id: 1,
                name: "Daten"
            },
            {
                id: 2,
                name: "Wissen"
            },
            {
                id: 3,
                name: "Information"
            }
        ],
        optionRows: [
            {
                id: 1,
                text: " „Müller“, „02.04.25“, „42“",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 2,
                text: "Frau Müller bestellt regelmäßig zu Monatsbeginn",
                correctAnswers: [
                    1
                ]
            },
            {
                id: 3,
                text: "Frau Müller hat am 2. April 42 Artikel bestellt",
                correctAnswers: [
                    2
                ]
            }
        ]
    },
    createdAt: new Date("2025-04-10T16:40:38.532Z"),
    lastEdited: new Date("2025-04-10T16:40:38.532Z")
});
        console.log(`Document inserted with id: ${result1.insertedId}`);
        results.push(result1);

        const result2 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f530d93fb13cd308e80b"),
    owner: 1,
    questiontext: "Fülle die Lücke richtig aus:",
    questiontags: [],
    questiontype: "FillInTheBlanks",
    questionconfiguration: {
        showBlanks: true,
        textParts: [
            {
                order: 1,
                text: "Information",
                isBlank: true
            },
            {
                order: 2,
                text: "ist",
                isBlank: false
            },
            {
                order: 3,
                text: "zweckbezogenes",
                isBlank: true
            },
            {
                order: 4,
                text: "Wissen",
                isBlank: true
            },
            {
                order: "null",
                text: "Daten",
                isBlank: "false"
            },
            {
                order: "null",
                text: "Syntax",
                isBlank: "false"
            }
        ]
    },
    createdAt: new Date("2025-04-10T16:43:28.991Z"),
    lastEdited: new Date("2025-04-10T16:43:28.991Z")
});
        console.log(`Document inserted with id: ${result2.insertedId}`);
        results.push(result2);

        const result3 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f553d93fb13cd308e80c"),
    owner: 1,
    questiontext: "Welche Aussage über Datenbanksysteme ist korrekt?",
    questiontags: [],
    questiontype: "Choice",
    questionconfiguration: {
        multipleRow: false,
        multipleColumn: false,
        answerColumns: [
            {
                id: 1,
                name: ""
            }
        ],
        optionRows: [
            {
                id: 1,
                text: "Sie ersetzen alle IT-Systeme in Unternehmen",
                correctAnswers: []
            },
            {
                id: 2,
                text: "Sie wandeln Wissen automatisch in Daten um",
                correctAnswers: []
            },
            {
                id: 3,
                text: "Sie sind die technologische Grundlage für die Arbeit mit Daten",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 4,
                text: "Sie arbeiten ausschließlich mit unstrukturierten Daten",
                correctAnswers: []
            }
        ]
    },
    createdAt: new Date("2025-04-10T16:44:03.307Z"),
    lastEdited: new Date("2025-04-10T16:44:03.307Z")
});
        console.log(`Document inserted with id: ${result3.insertedId}`);
        results.push(result3);

        const result4 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f575d93fb13cd308e80d"),
    owner: 1,
    questiontext: "Welche Eigenschaft trifft auf Informationen zu?",
    questiontags: [],
    questiontype: "Choice",
    questionconfiguration: {
        multipleRow: false,
        multipleColumn: false,
        answerColumns: [
            {
                id: 1,
                name: ""
            }
        ],
        optionRows: [
            {
                id: 1,
                text: "Sie verschleißen nicht",
                correctAnswers: []
            },
            {
                id: 2,
                text: "Sie sind exklusiv verwendbar",
                correctAnswers: []
            },
            {
                id: 3,
                text: "Sie sind nicht kopierbar",
                correctAnswers: []
            },
            {
                id: 4,
                text: "Sie können durch Zeit an Wert verlieren",
                correctAnswers: [
                    0
                ]
            }
        ]
    },
    createdAt: new Date("2025-04-10T16:44:37.816Z"),
    lastEdited: new Date("2025-04-10T16:44:37.816Z")
});
        console.log(`Document inserted with id: ${result4.insertedId}`);
        results.push(result4);

        const result5 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f593d93fb13cd308e80e"),
    owner: 1,
    questiontext: "Was ist ein Beispiel für eine temporäre Datenart?",
    questiontags: [],
    questiontype: "Choice",
    questionconfiguration: {
        multipleRow: false,
        multipleColumn: false,
        answerColumns: [
            {
                id: 1,
                name: ""
            }
        ],
        optionRows: [
            {
                id: 1,
                text: "Kundenstammdaten",
                correctAnswers: []
            },
            {
                id: 2,
                text: "Verkaufszahlen der letzten Stunde",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 3,
                text: "E-Mail-Adresse",
                correctAnswers: []
            },
            {
                id: 4,
                text: "Wohnort",
                correctAnswers: []
            }
        ]
    },
    createdAt: new Date,
    lastEdited: new Date
});
        console.log(`Document inserted with id: ${result5.insertedId}`);
        results.push(result5);

        const result6 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f5ddd93fb13cd308e80f"),
    owner: 1,
    questiontext: "Was war die zentrale Problematik beim Cambridge Analytica-Skandal?",
    questiontags: [],
    questiontype: "Choice",
    questionconfiguration: {
        multipleRow: false,
        multipleColumn: false,
        answerColumns: [
            {
                id: 1,
                name: ""
            }
        ],
        optionRows: [
            {
                id: 1,
                text: "Verlust von Daten durch Hacker",
                correctAnswers: []
            },
            {
                id: 2,
                text: "Manipulation durch künstliche Intelligenz",
                correctAnswers: []
            },
            {
                id: 3,
                text: "Unbewusste Preisgabe persönlicher Daten und deren Missbrauch",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 4,
                text: "Versehentliches Löschen von Nutzerkonten",
                correctAnswers: []
            }
        ]
    },
    createdAt: new Date,
    lastEdited: new Date
});
        console.log(`Document inserted with id: ${result6.insertedId}`);
        results.push(result6);

        const result7 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f5f8d93fb13cd308e810"),
    owner: 1,
    questiontext: "Welche Aussage ist korrekt in Bezug auf die Kategorisierung von Datentypen?",
    questiontags: [],
    questiontype: "Choice",
    questionconfiguration: {
        multipleRow: false,
        multipleColumn: false,
        answerColumns: [
            {
                id: 1,
                name: ""
            }
        ],
        optionRows: [
            {
                id: 1,
                text: "Unstrukturierte Daten sind immer nutzlos",
                correctAnswers: []
            },
            {
                id: 2,
                text: "Nur strukturierte Daten können analysiert werden",
                correctAnswers: []
            },
            {
                id: 3,
                text: "Video- und Audiodaten gelten als dynamisch",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 4,
                text: "Bit-orientierte Daten sind veraltet und kaum genutzt",
                correctAnswers: []
            }
        ]
    },
    createdAt: new Date,
    lastEdited: new Date
});
        console.log(`Document inserted with id: ${result7.insertedId}`);
        results.push(result7);

        const result8 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f617d93fb13cd308e811"),
    owner: 1,
    questiontext: "Welche Aussagen zur logischen und physischen Datenorganisation treffen zu?",
    questiontags: [],
    questiontype: "Choice",
    questionconfiguration: {
        multipleRow: true,
        multipleColumn: false,
        answerColumns: [
            {
                id: 1,
                name: ""
            }
        ],
        optionRows: [
            {
                id: 1,
                text: "Die logische Organisation bezieht sich auf die Speicherform auf der Festplatte",
                correctAnswers: []
            },
            {
                id: 2,
                text: "Die physische Organisation umfasst Zugriffsrechte und Sicherheitsfunktionen",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 3,
                text: "Die logische Organisation nutzt z. B. das Entity-Relationship-Modell",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 4,
                text: "Die physische Organisation ist für semantische Modellierung zuständig",
                correctAnswers: []
            }
        ]
    },
    createdAt: new Date,
    lastEdited: new Date
});
        console.log(`Document inserted with id: ${result8.insertedId}`);
        results.push(result8);

        const result9 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f673d93fb13cd308e812"),
    owner: 1,
    questiontext: "",
    questiontags: [],
    questiontype: "FillInTheBlanks",
    questionconfiguration: {
        showBlanks: false,
        textParts: [
            {
                order: 1,
                text: "Das Schichtenmodell (ANSI/SPARC) gliedert sich in die externe,",
                isBlank: false
            },
            {
                order: 2,
                text: "konzeptionelle",
                isBlank: true
            },
            {
                order: 3,
                text: "und",
                isBlank: false
            },
            {
                order: 4,
                text: "interne",
                isBlank: true
            },
            {
                order: 5,
                text: "Ebene.",
                isBlank: false
            }
        ]
    },
    createdAt: new Date,
    lastEdited: new Date
});
        console.log(`Document inserted with id: ${result9.insertedId}`);
        results.push(result9);

        const result10 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f691d93fb13cd308e813"),
    owner: 1,
    questiontext: "Welche Probleme löst das Datenbankkonzept im Vergleich zum Dateikonzept?",
    questiontags: [],
    questiontype: "Choice",
    questionconfiguration: {
        multipleRow: true,
        multipleColumn: false,
        answerColumns: [
            {
                id: 1,
                name: ""
            }
        ],
        optionRows: [
            {
                id: 1,
                text: "Reduziert Redundanzen",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 2,
                text: "Erhöht Datenkonsistenz",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 3,
                text: "Vermeidet das Konzept der Mehrbenutzerfähigkeit",
                correctAnswers: []
            },
            {
                id: 4,
                text: "Verbessert Datenintegration",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 5,
                text: "Führt zu mehr Flexibilität bei Datenverarbeitung",
                correctAnswers: [
                    0
                ]
            }
        ]
    },
    createdAt: new Date,
    lastEdited: new Date
});
        console.log(`Document inserted with id: ${result10.insertedId}`);
        results.push(result10);

        const result11 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f6dcd93fb13cd308e814"),
    owner: 1,
    questiontext: "Ordne den Ebenen der Drei-Schichten-Architektur ihre Merkmale zu: Externe Ebene, Konzeptionell, Interne Ebene",
    questiontags: [],
    questiontype: "Choice",
    questionconfiguration: {
        multipleRow: true,
        multipleColumn: true,
        answerColumns: [
            {
                id: 1,
                name: "Benutzerspezifische Sicht, Datenschutz"
            },
            {
                id: 2,
                name: "Data Dictionary, Integritätsregeln"
            },
            {
                id: 3,
                name: "Physikalische Speicherung, Zugriffsmöglichkeiten"
            }
        ],
        optionRows: [
            {
                id: 1,
                text: "Externe Ebene",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 2,
                text: "Konzeptionell",
                correctAnswers: [
                    1
                ]
            },
            {
                id: 3,
                text: "Interne Ebene",
                correctAnswers: [
                    2
                ]
            }
        ]
    },
    createdAt: new Date,
    lastEdited: new Date
});
        console.log(`Document inserted with id: ${result11.insertedId}`);
        results.push(result11);

        const result12 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f73fd93fb13cd308e815"),
    owner: 1,
    questiontext: "Welche Aussagen zum Datenbankmanagementsystem (DBMS) sind korrekt?",
    questiontags: [],
    questiontype: "Choice",
    questionconfiguration: {
        multipleRow: true,
        multipleColumn: false,
        answerColumns: [
            {
                id: 1,
                name: ""
            }
        ],
        optionRows: [
            {
                id: 1,
                text: "Ein DBMS verwaltet ausschließlich Zugriffsrechte",
                correctAnswers: []
            },
            {
                id: 2,
                text: "Ein DBMS führt Backups durch",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 3,
                text: "Ein DBMS implementiert das Datenmodell und ermöglicht Datenmanipulation",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 4,
                text: "Ein DBMS benötigt keinen Metadatenspeicher",
                correctAnswers: []
            },
            {
                id: 5,
                text: "Ein DBMS koordiniert parallele Transaktionen",
                correctAnswers: [
                    0
                ]
            }
        ]
    },
    createdAt: new Date,
    lastEdited: new Date
});
        console.log(`Document inserted with id: ${result12.insertedId}`);
        results.push(result12);

        const result13 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f75cd93fb13cd308e816"),
    owner: 1,
    questiontext: "Welche Vorteile bietet das Datenbankkonzept?",
    questiontags: [],
    questiontype: "Choice",
    questionconfiguration: {
        multipleRow: true,
        multipleColumn: false,
        answerColumns: [
            {
                id: 1,
                name: ""
            }
        ],
        optionRows: [
            {
                id: 1,
                text: "Geringere Redundanz",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 2,
                text: "Erhöhte Bearbeitungszeit",
                correctAnswers: []
            },
            {
                id: 3,
                text: "Mehrbenutzerbetrieb",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 4,
                text: "Totalverlust bei Systemabsturz",
                correctAnswers: []
            },
            {
                id: 5,
                text: "Besserer Datenschutz",
                correctAnswers: [
                    0
                ]
            }
        ]
    },
    createdAt: new Date,
    lastEdited: new Date
});
        console.log(`Document inserted with id: ${result13.insertedId}`);
        results.push(result13);

        const result14 = await questionInCatalogCollection.insertOne({
    _id: new mongoDB.ObjectId("67f7f774d93fb13cd308e817"),
    owner: 1,
    questiontext: "Welche Merkmale beschreiben eine gute Datenmodellierung in betrieblichen Informationssystemen?",
    questiontags: [],
    questiontype: "Choice",
    questionconfiguration: {
        multipleRow: true,
        multipleColumn: false,
        answerColumns: [
            {
                id: 1,
                name: ""
            }
        ],
        optionRows: [
            {
                id: 1,
                text: "Fehlervermeidend",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 2,
                text: "Effektiv und effizient",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 3,
                text: "Unabhängig von Benutzerbedürfnissen",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 4,
                text: "Hohe Flexibilität",
                correctAnswers: [
                    0
                ]
            },
            {
                id: 5,
                text: "Möglichst komplex in der Struktur",
                correctAnswers: []
            }
        ]
    },
    createdAt: new Date,
    lastEdited: new Date
});
        console.log(`Document inserted with id: ${result14.insertedId}`);
        results.push(result14);

        console.log(`All ${results.length} documents inserted successfully`);
    } catch (error) {
        console.error('Error inserting documents:', error);
    }
}

// Execute the function
insertQuestions();
