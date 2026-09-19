# web

This template should help get you started developing with Vue 3 in Vite.

## Naming conventions

- `Study` bezeichnet den produktiven Lernbereich. In der deutschen UI werden
  dafür „Lernen“ und „Lernsitzung“ verwendet.
- `StudySession` bezeichnet eine konkrete adaptive Lernsitzung.
- `Competency` ist der einzige Begriff für Kompetenzen.
- `Question` bezeichnet eine Aufgabe, `QuestionAttempt` einen gespeicherten
  Antwortversuch.
- `AlgorithmLab` ist ausschließlich für experimentelle und diagnostische
  Oberflächen vorgesehen.
- Gemeinsam von Study und Algorithm Lab verwendete Komponenten tragen keinen
  Feature-Prefix, zum Beispiel `QuestionInteraction`.
- Route-Komponenten enden mit `View`, Dialoge beginnen mit `Dialog`.
- Dateinamen für Services und Stores verwenden den jeweiligen Domänenbegriff,
  zum Beispiel `studySession.service.ts` und `studySessionStore.ts`.

## Konfiguration des Lernalgorithmus

- Kursbezogene Einstellungen werden unter `/courses/:courseId/settings`
  bearbeitet.
- In der Datenbank werden nur Abweichungen von den Anwendungsdefaults
  gespeichert. Modellparameter und Auswahlgewichte sind keine regulären
  Dozenteneinstellungen.
- Jede neue `StudySession` erhält serverseitig einen unveränderlichen Snapshot
  der effektiven Konfiguration und ihrer Kurskonfigurationsrevision. Änderungen
  an einem Kurs wirken daher nicht rückwirkend auf laufende Sitzungen.
- Der öffentliche, versionierte Vertrag liegt in
  `src/model/StudyAlgorithmConfig.ts`. Interne Änderungen am Algorithmus dürfen
  diesen Vertrag nicht beiläufig verändern.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
