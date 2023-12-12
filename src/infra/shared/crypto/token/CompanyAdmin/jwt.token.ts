import { sign } from 'jsonwebtoken'
import { verify } from 'jsonwebtoken';

import { createHmac } from 'crypto'

import { CompanyAdminEntity } from '../../../../../modules/Company/CompanyAdmin/entities/company-admin.entity';
import { TokenCompanyAdmin, ICompanyAdminToken } from '../CompanyAdmin/token';

export class CompanyAdminJWToken implements ICompanyAdminToken{
    private TOKEN_SECRET = process.env.SECRET_KEY_TOKEN_COMPANY_ADMIN || ''

    private TOKEN_SECRET_CRYPTO = createHmac('sha256', this.TOKEN_SECRET).digest('base64')

    create({ cnpj, id, email }: CompanyAdminEntity): string {
        const token = sign({
            admin: {
                cnpj,
                id,
                email
            }
        }, this.TOKEN_SECRET_CRYPTO, {
            subject: id,
            expiresIn: '1D'
        })

        return token
    }
    validate(token: string): TokenCompanyAdmin | null {
        try {
            const tokenAdmin = verify(token, this.TOKEN_SECRET_CRYPTO) as TokenCompanyAdmin
            return tokenAdmin

        } catch (err) {
            return null
        }
    }

}