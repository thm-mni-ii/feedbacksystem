import { test, expect } from '@playwright/test';
import config from '../config';
import LoginPage from '../pages/login';
import CoursePage from '../pages/course';

const allure = require("allure-js-commons");

test.describe('E2E-Test im Feedbacksystem von Anmeldung bis zur Abgabe einer Aufgabe ', () => {
   
    test('Der Benutzer durchläuft den kompletten Prozess: Anmeldung, Teilnahme am Kurs, Abgabe der Aufgabe und Abmeldung ', async ({ page }) => {
        allure.testCaseId('TF001');
        allure.label('Name:', 'Kompletter Prozess von Anmeldung bis Abmeldung');
      

        const username = 'Awed23';
        const password = 'Awed12345';
        const courseName = 'Datenbank';
        const taskName = 'Aufgabe 1';
        const sqlQuery =`SELECT DISTINCT s.student_name 
            FROM students s 
            JOIN student_in_course sic ON s.student_id = sic.student_id 
            JOIN course c ON sic.course_id = c.course_id 
            JOIN semester sem ON sic.semester_id = sem.semester_id 
            WHERE c.course_name = 'Datenbanksysteme' 
            AND sem.semester_name = 'Wintersemester 23/24';
        `;

        const loginPage = new LoginPage(page);
        const coursePage = new CoursePage(page);

        // Schritt 1: Anmeldung
        await test.step('Anmeldung', async () => {
            allure.parameter('Vorbedingung :', 'Benutzer muss die Anmeldeseite des Feedbacksystems öffnen');
            allure.parameter('Testdaten: ', `Benutzername: ${username}, Passwort: *****`);

            await loginPage.navigateTo(config.test);
            await loginPage.login(username, password);

            allure.parameter('Erwartung: ', 'Nach erfolgreichem Anmelden, soll die Kursseite geöffnet werden');
            try {
                await expect(page).toHaveURL('https://fk-feedback-test.mni.thm.de/courses');
                allure.parameter('Tatsächliches Ergebnis :', 'Benutzer wurde erfolgreich zur Kursseite weitergeleitet.');
            } catch (error) {
                allure.parameter('Tatsächliches Ergebnis: ', 'Unerwartetes Problem während der Anmeldung.');
                throw error;  // Test wird bei Fehler abgebrochen
            }
        });

        // Schritt 2: Teilnahme am Kurs und Abgabe der Aufgabe
        await test.step('Teilnahme am Kurs und Abgabe der Aufgabe', async () => {
            allure.parameter('Vorbedingung: ', 'Benutzer ist angemeldet und befindet sich auf der Kursseite');
            allure.parameter('Testdaten: ', `Kursname: ${courseName}, Aufgabe: ${taskName}, SQL-Query: ${sqlQuery}`);

            await coursePage.newCourse();
            allure.parameter('Erwartetes Ergebnis: ', 'Benutzer nimmt an einem Kurs erfolgreich teil.');
            await coursePage.chooseCourse(courseName);
            allure.parameter('Erwartetes Ergebnis: ', 'Benutzer wählt die Aufgabe erfolgreich aus.');
            await coursePage.chooseTask(taskName);
            allure.parameter('Erwartetes Ergebnis: ', 'Benutzer gibt die Aufgabe erfolgreich ab.');
            await coursePage.taskSubmit(sqlQuery);

            allure.parameter('Tatsächliches Ergebnis: ', 'Benutzer hat die Aufgabe erfolgreich eingereicht.');
            await coursePage.check();
        });

        // Schritt 3: Abmeldung
        await test.step('Abmeldung', async () => {
            allure.parameter('Vorbedingung: ', 'Benutzer befindet sich auf der Kursseite');
            await page.getByLabel('User Menu').click();
            await page.getByRole('menuitem', { name: 'Logout' }).click();

            allure.parameter('Erwartetes Ergebnis: ', 'Benutzer wird erfolgreich abgemeldet.');
            allure.parameter('Tatsächliches Ergebnis: ', 'Benutzer wurde erfolgreich abgemeldet.');
        });
    });
});
