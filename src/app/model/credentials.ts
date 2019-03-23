/**
 * This file contains functionality for storing important user credentials
 */

import { promises as fs } from 'fs';
import * as cryptojs from 'crypto-js';
import { logger } from 'logger';

const CREDENTIALS_FILE = './.app/credentials.json';
const SECRET_PASS = "passphrase";

export class CredentialsLoadError extends Error {}

/**
 * Store credentials in file
 */
export async function store(username: string, password: string) {
  logger.info(`Storing ${username} and associated password in ${CREDENTIALS_FILE}`);

  const file = {
    username: cryptojs.AES.encrypt(username, SECRET_PASS).toString(),
    password: cryptojs.AES.encrypt(password, SECRET_PASS).toString()
  };

  await fs.writeFile(CREDENTIALS_FILE, JSON.stringify(file), {encoding: 'utf-8'});
}

/**
 * Load credentials from file
 */
export async function load() {
  try {
    const file = JSON.parse((await fs.readFile(CREDENTIALS_FILE)).toString('utf-8'));

    return {
      username: cryptojs.AES.decrypt(file.username, SECRET_PASS).toString(cryptojs.enc.Utf8),
      password: cryptojs.AES.decrypt(file.password, SECRET_PASS).toString(cryptojs.enc.Utf8)
    };
  } catch(e) {
    if(e.code && "ENOENT" === e.code) {
      throw new CredentialsLoadError("No credentials saved");
    } else {
      throw e;
    }
  }
}
