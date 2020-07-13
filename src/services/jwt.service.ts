
import { sign, verify, VerifyOptions, decode } from 'jsonwebtoken';
import { TOKEN_EXPIRY_TIME } from '../constants';
import { JWT_ENC_KEY, JWT_PRIVATE_KEY, JWT_PUBLIC_KEY } from '../utils';
import { ITokenPayload } from '../interfaces';

export class JwtService {
    private alogorithm = 'RS256';
    constructor() {

    }

    async createToken(payload: any, expiryTime?: string | number) {
        try {
            return await this.signToken(payload, expiryTime);
        } catch (err) {
            throw err;
        }
    }

    verifyToken(token: string, options?: VerifyOptions): Promise<ITokenPayload> {
        return new Promise((resolve, reject) => {
            verify(token, JWT_PUBLIC_KEY, options, (err, decoded: ITokenPayload) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(decoded);
                }
            })
        });
    }

    private signToken(payload: any, expiryTime?: string | number): Promise<string> {
        return new Promise((resolve, reject) => {
            sign(payload, JWT_PRIVATE_KEY, {
                encoding: 'utf-8',
                algorithm: this.alogorithm,
                expiresIn: expiryTime || TOKEN_EXPIRY_TIME
            }, (err, token: string) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(token);
                }
            });
        });
    }
}


export const jwtService = new JwtService();