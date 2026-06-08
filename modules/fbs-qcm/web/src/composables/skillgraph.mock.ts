import type { Skill, Tag, Question } from '@/model/Skillgraph'

export const mockSkills: Skill[] = [
  { id: 's1', name: 'SQL Grundlagen', description: 'Grundlegende SQL-Abfragen' },
  { id: 's2', name: 'Datenbankdesign', description: 'ER-Modellierung' },
  { id: 's3', name: 'OOP Konzepte', description: 'Objektorientierung' },
  { id: 's4', name: 'ER-Modellierung', description: 'ER-Modellierung' },
  { id: 's5', name: 'SQL Fortgeschritten', description: 'Komplexe SQL-Abfragen' },
  { id: 's6', name: 'Normalisierung', description: 'Datenbanknormalisierung' },
  { id: 's7', name: 'Transaktionen', description: 'ACID und Transaktionsmanagement' },
  { id: 's8', name: 'Indizes', description: 'Performanceoptimierung durch Indizes' },
  { id: 's9', name: 'Datenbankarchitektur', description: 'Architektur relationaler Datenbanken' },
  {
    id: 's10',
    name: 'Objektorientiertes Design',
    description: 'Entwurf objektorientierter Systeme'
  }
]

export const mockTags: Tag[] = [
  { id: 't1', label: '#SQL' },
  { id: 't2', label: '#SQL/select', parentId: 't1' },
  { id: 't3', label: '#SQL/join', parentId: 't1' },
  { id: 't4', label: '#SQL/delete', parentId: 't1' },
  { id: 't5', label: '#SQL/update', parentId: 't1' },
  { id: 't6', label: '#SQL/insert', parentId: 't1' },
  { id: 't7', label: '#SQL/group-by', parentId: 't1' },
  { id: 't8', label: '#SQL/subqueries', parentId: 't1' },

  { id: 't9', label: '#Normalisierung' },
  { id: 't10', label: '#Normalisierung/1NF', parentId: 't9' },
  { id: 't11', label: '#Normalisierung/2NF', parentId: 't9' },
  { id: 't12', label: '#Normalisierung/3NF', parentId: 't9' },
  { id: 't13', label: '#Normalisierung/BCNF', parentId: 't9' },

  { id: 't14', label: '#ER-Modellierung' },
  { id: 't15', label: '#ER-Modellierung/Entitäten', parentId: 't14' },
  { id: 't16', label: '#ER-Modellierung/Beziehungen', parentId: 't14' },
  { id: 't17', label: '#ER-Modellierung/Kardinalitäten', parentId: 't14' },

  { id: 't18', label: '#Transaktionen' },
  { id: 't19', label: '#Transaktionen/ACID', parentId: 't18' },
  { id: 't20', label: '#Transaktionen/Locks', parentId: 't18' },
  { id: 't21', label: '#Transaktionen/Deadlocks', parentId: 't18' },

  { id: 't22', label: '#Indizes' },
  { id: 't23', label: '#Indizes/B-Tree', parentId: 't22' },
  { id: 't24', label: '#Indizes/Hash', parentId: 't22' },

  { id: 't25', label: '#Schlüssel' },
  { id: 't26', label: '#Schlüssel/Primärschlüssel', parentId: 't25' },
  { id: 't27', label: '#Schlüssel/Fremdschlüssel', parentId: 't25' },
  { id: 't28', label: '#Schlüssel/Kandidatschlüssel', parentId: 't25' },

  { id: 't29', label: '#Integrität' },
  { id: 't30', label: '#Integrität/Referenzielle-Integrität', parentId: 't29' }
]

export const mockQuestions: Question[] = [
  { id: 'q1', text: 'Was ist ein SELECT Statement?', skillId: 's1', tags: ['t3'] },
  { id: 'q2', text: 'Wie funktioniert INNER JOIN?', skillId: 's1', tags: ['t4'] },
  { id: 'q3', text: 'DELETE vs. TRUNCATE?', skillId: 's1', tags: ['t5'] },
  { id: 'q4', text: 'Was ist die 3. Normalform?', skillId: 's2', tags: ['t6', 't16'] },
  { id: 'q5', text: 'Wie erstellt man ein ER-Diagramm?', skillId: 's2', tags: ['t24'] },
  { id: 'q6', text: 'Was ist eine Klasse in OOP?', skillId: 's3', tags: ['t9'] },
  { id: 'q7', text: 'Was ist Polymorphismus?', skillId: 's3', tags: ['t28'] },
  { id: 'q8', text: 'Wie funktioniert OUTER JOIN?', skillId: 's5', tags: ['t4'] },

  { id: 'q9', text: 'Wofür wird UPDATE verwendet?', skillId: 's1', tags: ['t10'] },
  { id: 'q10', text: 'Wie funktioniert INSERT INTO?', skillId: 's1', tags: ['t11'] },
  { id: 'q11', text: 'Wann verwendet man GROUP BY?', skillId: 's5', tags: ['t12'] },
  { id: 'q12', text: 'Was sind Unterabfragen (Subqueries)?', skillId: 's5', tags: ['t13'] },
  {
    id: 'q13',
    text: 'Was ist der Unterschied zwischen WHERE und HAVING?',
    skillId: 's5',
    tags: ['t12']
  },
  { id: 'q14', text: 'Wie funktioniert ein CROSS JOIN?', skillId: 's5', tags: ['t4'] },

  { id: 'q15', text: 'Was ist die 1. Normalform?', skillId: 's6', tags: ['t14'] },
  { id: 'q16', text: 'Was ist die 2. Normalform?', skillId: 's6', tags: ['t15'] },
  { id: 'q17', text: 'Wann verletzt ein Schema die BCNF?', skillId: 's6', tags: ['t17'] },
  { id: 'q18', text: 'Warum wird normalisiert?', skillId: 's6', tags: ['t6'] },

  { id: 'q19', text: 'Was bedeutet ACID?', skillId: 's7', tags: ['t19'] },
  { id: 'q20', text: 'Was ist eine Datenbanktransaktion?', skillId: 's7', tags: ['t18'] },
  { id: 'q21', text: 'Wozu dienen Locks?', skillId: 's7', tags: ['t20'] },
  { id: 'q22', text: 'Was ist ein Deadlock?', skillId: 's7', tags: ['t20'] },

  { id: 'q23', text: 'Was ist ein Index?', skillId: 's8', tags: ['t21'] },
  { id: 'q24', text: 'Wann verbessert ein Index die Performance?', skillId: 's8', tags: ['t21'] },
  { id: 'q25', text: 'Wie funktioniert ein B-Tree Index?', skillId: 's8', tags: ['t22'] },
  { id: 'q26', text: 'Wann eignet sich ein Hash-Index?', skillId: 's8', tags: ['t23'] },

  { id: 'q27', text: 'Was ist eine Entität?', skillId: 's4', tags: ['t25'] },
  { id: 'q28', text: 'Was ist eine Beziehung im ER-Modell?', skillId: 's4', tags: ['t26'] },
  { id: 'q29', text: 'Was ist eine n:m-Beziehung?', skillId: 's4', tags: ['t26'] },
  { id: 'q30', text: 'Wie werden Kardinalitäten dargestellt?', skillId: 's4', tags: ['t26'] },

  { id: 'q31', text: 'Was versteht man unter Vererbung?', skillId: 's10', tags: ['t27'] },
  { id: 'q32', text: 'Was ist Kapselung?', skillId: 's10', tags: ['t30'] },
  { id: 'q33', text: 'Was bedeutet Abstraktion?', skillId: 's10', tags: ['t29'] },
  { id: 'q34', text: 'Was ist Methodenüberschreibung?', skillId: 's10', tags: ['t27', 't28'] },
  {
    id: 'q35',
    text: 'Was ist der Unterschied zwischen Klasse und Objekt?',
    skillId: 's3',
    tags: ['t9']
  },

  { id: 'q36', text: 'Was ist ein Primärschlüssel?', skillId: 's2', tags: ['t1'] },
  { id: 'q37', text: 'Was ist ein Fremdschlüssel?', skillId: 's2', tags: ['t1'] },
  {
    id: 'q38',
    text: 'Was versteht man unter referenzieller Integrität?',
    skillId: 's9',
    tags: ['t1']
  },
  { id: 'q39', text: 'Was ist eine relationale Datenbank?', skillId: 's9', tags: ['t1'] },
  {
    id: 'q40',
    text: 'Welche Vorteile bieten relationale Datenbanken?',
    skillId: 's9',
    tags: ['t1']
  }
]
