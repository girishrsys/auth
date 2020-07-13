import { createCipher, createDecipheriv, randomBytes, createDecipher } from 'crypto';
import { ENC_KEY, IV } from './secret.util';
import { rejects } from 'assert';


class Crypto {

    /**
      * @description This function return promise of hashed string Algorithm used is aes192
      * @param text string|number The string or number that needs to be encrypted
      */
    encryptData(text: string | number): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const cip = createCipher('aes256', ENC_KEY);
                let encrypted = cip.update(text.toString(), 'utf8', 'hex');
                encrypted += cip.final('hex');
                resolve(encrypted);
            } catch (err) {
                reject(new Error('Error in creating the cipher'));
            }
        });
    }

    /**
  * @description This function return promise of hashed string Algorithm used is aes192
  * @param encrypted string|number The string or number that needs to be decrypted
  */
    decryptData(encrypted: string | number): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const decipher = createDecipher('aes256', ENC_KEY);
                let decrypted = decipher.update(encrypted.toString(), 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                resolve(decrypted);
            } catch (err) {
                reject(new Error('Error in decrypting'));
            }
        })
    }
}

export const cryptoUtil = new Crypto();

