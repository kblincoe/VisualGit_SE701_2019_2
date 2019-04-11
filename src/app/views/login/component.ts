import { logger } from 'logger';
import { Component, NgZone, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthenticationError, ConnectionError } from 'model/user';
import { CredentialsLoadError } from 'model/credentials';
import { UserService } from 'services/user';
import { ErrorService } from 'services/error.service';

/**
 * Handles user login, and options therein
 */
@Component({
  selector: 'app-login',
  templateUrl: 'component.html',
  styleUrls: ["component.scss"]
})
export class LoginComponent implements OnInit {
  // Auto load the user service
  public constructor(
    private userService: UserService,
    private errorService: ErrorService,
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
   * Try to automatically login when the login page is loaded.
   */
  ngOnInit() {
    this.relogin();
  }

  /**
   * Login using the login info
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
      if(error instanceof AuthenticationError)
        this.showAuthenticateError = true;
      else
        this.errorService.displayError(error);
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
      // Ignore if there is no credential file
      // Otherwise display error information
      if (error instanceof CredentialsLoadError) {
        logger.info("Credentials can't be loaded from file");
        return;
      }

      logger.info("Relog in failed");
      logger.info(error);
      if(error instanceof AuthenticationError)
        this.showAuthenticateError = true;
      else
        this.errorService.displayError(error);
    }
  }

  /**
   * Doesn't login, but continues anyway
   */
  async bypassLogin() {
    try {
      await this.userService.loginAsGuest();
      this.switchToMainPanel();
    } catch(error) {
      if(error instanceof ConnectionError) {
        // Allow guest login when not connected to github, but warn
        this.errorService.displayError("Warning: No connection to GitHub. Some features may not work.");
        this.switchToMainPanel();
      } else {
        this.errorService.displayError(error);
      }
    }
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
