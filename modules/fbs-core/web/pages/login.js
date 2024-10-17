import { expect } from '@playwright/test';

class LoginPage {

    constructor(page) {
        this.page = page;
        this.usernameInput = page.locator('input[name="username"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.loginButton = page.getByRole('button', { name: 'Lokale Anmeldung' });
    }

    async navigateTo(EnvURL) {
        await this.page.goto(EnvURL);
    }

    async isLoginFormVisible() {
        await expect(this.usernameInput).toBeVisible();
        await expect(this.passwordInput).toBeVisible();
        await expect(this.loginButton).toBeVisible();
    }

    async login(username, password) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async isErrorMessageVisible() {
        await expect(page.locator('text=Prüfen Sie Ihren Benutzernamen und Ihr Passwort.')).toBeVisible();
    }

}
export default LoginPage;