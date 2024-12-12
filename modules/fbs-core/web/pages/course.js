import { expect } from '@playwright/test';

class CoursePage {

    constructor(page) {
        this.page = page;
    }

    async newCourse() {
        await this.page.getByRole('link', { name: 'Kurse', exact: true }).click();
    }

    async chooseCourse(kursname) {
        await this.page.getByText(kursname, { exact: true }).click();
    }

    async chooseTask(aufgabe) {
        await this.page.getByText(aufgabe, { name: aufgabe }).click();
    }

    async taskSubmit(loesung) {
        await this.page.getByLabel('Abgabe Text: ').fill(loesung);
        await this.page.getByRole('Button', { name: 'Abgeben' }).click();
        
    }

    async check(){
        
        try {
            await expect(this.page.locator('td:has-text("OK")')).toBeVisible({timeout: 3000});

        } catch ( error )   {

            console.log("Fehler bei der Abgabe");

            const errorMessageLocator = this.page.locator('[role="alert"], .error-message, .alert, td:has-text("SQLException")');

            if (await errorMessageLocator.isVisible () ) {
                const errorMessage = await errorMessageLocator.innerText();
                console.error("Fehler bei der Abgabe:", errorMessage);
            } else {
                console.error("Abgabe nicht erfolgreich und keine Fehlermeldung sichtbar.");
            }
        }
    }
}
export default CoursePage;