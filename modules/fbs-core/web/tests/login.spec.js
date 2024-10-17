import { test, expect } from '@playwright/test';
import config from '../config';
import LoginPage from '../pages/login';


test.describe('Loginseite Test', () => {

    test('Überprüfe, ob das Anmeldeformular vorhanden ist', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo(config.local);
        await loginPage.isLoginFormVisible();
    });

    test('Auf lokale Umgebung mit gültigen Anmededaten einlogen', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo(config.local);
        await loginPage.login('awed', 'Awed12345');
        await expect(page).toHaveURL('http://localhost:4200/courses');
    });

    test('Anmeldung ist fehlgeschlagen, da entweder Nutzername oder Passwort falsch eingegben wurde', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigateTo(config.local);
        await loginPage.login('admin', 'falsches Passwort');
        await expect(page.locator('text=Prüfen Sie Ihren Benutzernamen und Ihr Passwort.')).toBeVisible();
    });

});