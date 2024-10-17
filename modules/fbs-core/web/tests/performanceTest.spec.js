import { test, expect, chromium} from '@playwright/test';
import config from '../config';
import LoginPage from '../pages/login';

const allure = require("allure-js-commons");
const loginUrl = config.test; 
const user = { username: 'Awed23', password: 'Awed12345' }; 


test('Performance-Test: Die Anmeldung erfolgt 10-Mal mit dem gleichen Benutzer', async () => {

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
  
    const loginAttempts = 10; 
  
    // Simuliere 10 aufeinanderfolgende Anmeldeversuche für denselben Benutzer
    for (let i = 0; i < loginAttempts; i++) {
      const page = await context.newPage();
      const loginPage = new LoginPage(page);
  
      // Navigiere zur Login-Seite
      await loginPage.navigateTo(loginUrl);
  
      // Fülle das Anmeldeformular aus
      await loginPage.login(user.username, user.password);
  
      // Warte, bis die Seite nach der Anmeldung vollständig geladen ist (z.B. Dashboard)
      await page.waitForLoadState('load');
  
      // Überprüfe, ob die Anmeldung erfolgreich war
      await expect(page).toHaveURL('https://fk-feedback-test.mni.thm.de/courses'); // Ersetze mit der Zielseite nach der Anmeldung
  
      console.log(`Anmeldeversuch ${i + 1} für Benutzer ${user.username} erfolgreich.`);
  
      // Browser-Tab schließen
      await page.close();
    }
  
    // Browser schließen
    await browser.close();


});
