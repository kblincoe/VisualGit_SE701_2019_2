import { logger } from 'logger';

import * as nodegit from 'nodegit';
import * as Octokit from '@octokit/rest';

export class AuthenticationError extends Error {}

/**
 * Represents a logged in user.
 */
export class User {

  /**
   * Asynchronously creates a user by logging in.
   *
   * Note: We use a static creator as the operation is asynchronous.
   */
  public static async login(username: string, password: string, authenticator: () => Promise<string> = null): Promise<User> {
    logger.info(`Logging in as ${username}`);

    // Create the git credentials (for repo usage).
    const cred = nodegit.Cred.userpassPlaintextNew(username, password);

    authenticator = authenticator || (() => {
      logger.info("Log in failed: Requires 2fa");
      throw new AuthenticationError(`2 factor authentication required for user ${username}, but not implemented in VisualGit`);
    });

    const octokit = new Octokit({
      auth: {
        username,
        password,
        on2fa: authenticator
      },
      userAgent: 'octokit/rest.js v1.2.3',
    });

    // Unfortunately not typed. See https://developer.github.com/v3/users/#get-the-authenticated-user
    // Doing this to ensure authentication of user credentials
    try {
      const userInfo = await octokit.users.getAuthenticated();

      return new User(
        cred,
        octokit,
        userInfo.data.name,
        userInfo.data.url,
        userInfo.data.avatar_url,
        true
      );
    } catch(error) {
      if(error.status === 401 || error.status === 404) {
        throw new AuthenticationError("Username or password incorrect");
      } else {
        throw error;
      }
    }
  }

  /**
   * Asynchronously creates an unauthenticated user
   *
   * Note: Function does not need to be async, but is for compatibility with login()
   */
  public static async createUnauthenticated(): Promise<User> {
    logger.info(`Logging in as unauthenticated`);

    // Create the git credentials (for repo usage).
    const cred = nodegit.Cred.defaultNew();

    const octokit = new Octokit({userAgent: 'octokit/rest.js v1.2.3'});

    return new User(
      cred,
      octokit,
      'guest',
      null,
      null,
      false
    );
  }

  // Can only create the user via login()
  private constructor(
    public gitCredentials: nodegit.Cred,
    public github: Octokit,
    public name: string,
    public userUrl: string,
    public avatarUrl: string,
    public authenticated: boolean
  ) {}
}
