import { logger } from 'logger';
import { promises as fs } from 'fs';
import * as path from 'path';

import * as nodegit from 'nodegit';
import * as Octokit from '@octokit/rest';

import * as uuid from "uuid";

export class AuthenticationError extends Error {}
export class SshAuthenticationError extends AuthenticationError {}

// See https://developer.github.com/v3/users/#get-the-authenticated-user for more types that could be added
interface UserGithubInfo {
  url: string;
  avatar_url: string;
}

/**
 * Discovers credentials in the given folder
 * @param directory The directory to look in. Is not recursive. By default, looks in ~/.ssh
 * @returns An array of credential files.
 */
export async function discoverSshCredentials(directory?: string) {
  // Confirm the path is valid
  const fnames = await fs.readdir(directory);

  // Look for public keys as files ending in .pub, get privates as any file whose name corresponds to the public key name
  const publics = fnames.filter(name => name.endsWith('.pub'));

  const results = publics.map(pubKey => ({
    publicPath: path.join(directory, pubKey),
    privatePath: path.join(
      directory,
      fnames.find(fname =>
        fname.includes(pubKey.replace('.pub', ''))
      ))
  }))
  .filter(result => result.privatePath !== directory); // Remove results where no private was found

  return results;
}


/**
 * Represents a logged in user.
 */
export class User {

  /**
   * Asynchronously creates a user by logging in.
   *
   * Note: We use a static creator as the operation is asynchronous.
   */
  public static async login(username: string, password: string, authenticator?: () => Promise<string>): Promise<User> {
    logger.info(`Logging in as ${username}`);

    const octokit = new Octokit({
      auth: {
        username, password, on2fa: authenticator
      },
      userAgent: 'octokit/rest.js v1.2.3',
    });

    await octokit.oauthAuthorizations.createAuthorization({note: uuid.v1()});

    const gitCredentials = await User.generateGitCredentials(username, password);

    // Unfortunately not typed. See https://developer.github.com/v3/users/#get-the-authenticated-user
    // Doing this to ensure authentication of user credentials
    try {
      const githubInfo = await octokit.users.getAuthenticated();

      return new User(
        gitCredentials,
        octokit,
        username,
        githubInfo.data,
        password
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
   */
  public static async createUnauthenticated(): Promise<User> {
    logger.info(`Logging in as guest`);

    // Create the git credentials (for repo usage).
    const cred = await User.generateGitCredentials("guest");

    const octokit = new Octokit({userAgent: 'octokit/rest.js v1.2.3'});
    const guestAvatar = './assets/VisualGit_Logo.png';
    return new User(
      cred,
      octokit,
      'guest',
      { url: null, avatar_url: guestAvatar },
      "",
    );
  }

  public isAuthenticated(): boolean {
    return !!this.password;
  }

  /**
   * Adds ssh credentials found in the given directory
   * @param public Path to public key file
   * @param private Path to private key file
   * @param passphrase The passphrase for the private key, if there is one
   */
  public async addSshCredentials(publicPath: string, privatePath: string, passphrase?: string) {
    this.gitCredentials = await User.generateGitCredentials(
      this.name,
      this.password,
      {public: publicPath, private: privatePath, passphrase}
    );
  }

  // Can only create the user via login()
  private constructor(
    public gitCredentials: nodegit.RemoteCallbacks,
    public github: Octokit,
    public name: string,
    public githubInfo: UserGithubInfo,
    private password?: string
  ) {}

  /**
   * Generates the git credentials (in callback form used by nodegit) for repository fetching
   */
  private static async generateGitCredentials(
    username: string,
    password?: string,
    ssh?: {public: string, private: string, passphrase?: string}
  ): Promise<nodegit.RemoteCallbacks> {
    // Generate all the credential objects
    const usernameCred = await nodegit.Cred.usernameNew(username);
    const userPassCred = password ? nodegit.Cred.userpassPlaintextNew(username, password) : null;

    // Refer to https://libgit2.org/docs/guides/authentication/
    return {
      certificateCheck() {
        return 1;
      },

      credentials(url: string, usernameFromUrl: string, allowedTypes: number) {
        if((allowedTypes & nodegit.Cred.TYPE.SSH_KEY) > 0) {
          if(!ssh)
            logger.error("Repository asks for ssh credentials when none are supplied");

          return nodegit.Cred.sshKeyNew(usernameFromUrl, ssh.public, ssh.private, ssh.passphrase || "");
        }

        if((allowedTypes & nodegit.Cred.TYPE.USERPASS_PLAINTEXT) > 0) {
          if(!password) {
            logger.error("Repository asked for passworded credentials when none are available");
          }
          return userPassCred;
        }

        if((allowedTypes & nodegit.Cred.TYPE.USERNAME) > 0)
          return usernameCred;

        // Default response
        if(ssh)
          return nodegit.Cred.sshKeyNew(usernameFromUrl, ssh.public, ssh.private, ssh.passphrase || "");
        else if(password)
          return userPassCred;
        else
          return nodegit.Cred.defaultNew();
      }
    };
  }
}
