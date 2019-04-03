import { logger } from 'logger';
import { Component, NgZone } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthenticationError } from 'model/user';
import { CredentialsLoadError } from 'model/credentials';
import { UserService } from 'services/user';

/**
 * Handles user login, and options therein
 */
@Component({
  selector: 'app-login',
  templateUrl: 'component.html',
  styleUrls: ["component.scss"]
})
export class LoginComponent {
  // Auto load the user service
  public constructor(
    private userService: UserService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  createNewAccount(): void {
    window.open("https://github.com/join?", "_blank");
  }

  resetPassword() {
    window.open("https://github.com/password_reset", "_blank");
  }

  /**
   * Submits the login info
   */
  async login() {
    const username = this.loginForm.controls.username.value;
    const password = this.loginForm.controls.password.value;

    if(this.loginForm.controls.remember.value === true) {
      await this.userService.store(username, password);
    }

    try {
      await this.userService.login(username, password);

      // If login works, move to main screen
      this.switchToMainPanel();
    } catch(error) {
      logger.info("Log in failed");
      logger.info(error);
      this.showAuthenticateError = true;
    }
  }

  /**
   * Submits the stored login info
   */
  async relogin() {
    try {
      await this.userService.relogin();

      this.switchToMainPanel();
    } catch(error) {
      logger.info("Relog in failed");
      logger.info(error);
      if(error instanceof AuthenticationError) {
        this.showAuthenticateError = true;
      }
      else if(error instanceof CredentialsLoadError) {
        this.showCredentialLoadError = true;
      }
    }
  }

  /**
   * Doesn't login, but continues anyway
   */
  async bypassLogin() {
    await this.userService.loginAsGuest();
    this.switchToMainPanel();
  }

  loginForm = new FormGroup({
    username: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required]),
    remember: new FormControl(false)
  });

  showAuthenticateError = false;
  showCredentialLoadError = false;

  private switchToMainPanel() {
    this.showAuthenticateError = false;
    this.showCredentialLoadError = false;

    this.ngZone.run(() => this.router.navigate(['/select']));
  }
}
