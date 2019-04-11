import { logger } from 'logger';

import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";

import { User, ConnectionError } from 'model/user';
import { CredentialsLoadError } from 'model/credentials';
import * as credentials from 'model/credentials';

import { TwoFactorConfirmService } from "services/twofactorconfirm.service";
/**
 * Handles user login and credential information for github
 */
@Injectable({ providedIn: 'root' })
export class UserService {

  public constructor(
    private twoFactorService: TwoFactorConfirmService
  ) { }
  /**
   * Attempts to login with the given credentials.
   * Throws (asynchronously) upon error and does not update user.
   */
  public async login(username: string, password: string) {
    const twoFactorCallback = () => this.twoFactorService.displayModal()
      .then(
        (result) => new Promise<string>((resolve, reject) => {
          resolve(result.code);
        }
        ));
    const user = await User.login(username, password, twoFactorCallback);
    this.user.next(user);
  }

  /**
   * Logs in without credentials as a guest.
   *
   * NOTE: If there is a connection error, will throw but log in anyway,
   * to allow access to the rest of the application
   */
  public async loginAsGuest() {
    const user = await User.createUnauthenticated();
    this.user.next(user);

    // Get one repo from github as a connection test
    try {
      await user.github.repos.list({per_page: 1, page: 1});
    } catch(error) {
      if(error.status === 500) // Octokit seems to use 500 for connection issues.
        throw new ConnectionError("Cannot reach GitHub servers. Are you connected to the internet?");
      else
        throw error;
    }
  }

  /**
   * Logs out the user.
   */
  public async logout() {
    // Disable automatic login when logout
    await credentials.remove();
    this.user.next(null);
  }

  /**
   * Logs in using saved credentials.
   * Throws error message of "Credentials not saved" when there are no credentials, and also throws login errors.
   */
  public async relogin() {
    const { username, password } = await credentials.load();
    logger.verbose("Logging in with saved credentials");
    return await this.login(username, password);
  }

  /**
   * Stores the given credentials
   */
  public async store(username: string, password: string) {
    logger.verbose("Storing user credentials");
    await credentials.store(username, password);
  }

  public observeUser() {
    return this.user.asObservable();
  }
  public getUser() {
    return this.user.getValue();
  }

  private user: BehaviorSubject<User> = new BehaviorSubject(null);
}
