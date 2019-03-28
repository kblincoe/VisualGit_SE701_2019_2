import { logger } from 'logger';

import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";

import { User } from 'model/user';
import * as credentials from 'model/credentials';

/**
 * Handles user login and credential information for github
 */
@Injectable({providedIn: 'root'})
export class UserService {
  /**
   * Attempts to login with the given credentials.
   * Throws (asynchronously) upon error and does not update user.
   */
  public async login(username: string, password: string) {
    logger.verbose("Logging in with username: " + username);
    const user = await User.login(username, password);
    this.user.next(user);
  }

  /**
   * Logs in without credentials as a guest.
   */
  public async loginAsGuest() {
    this.user.next(await User.createUnauthenticated());
  }

  /**
   * Logs out the user.
   */
  public async logout() {
    this.user.next(null);
  }

  /**
   * Logs in using saved credentials.
   * Throws error message of "Credentials not saved" when there are no credentials, and also throws login errors.
   */
  public async relogin() {
    const {username, password} = await credentials.load();
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
