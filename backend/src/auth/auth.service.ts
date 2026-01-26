import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) { }

    async signUp(name: string, email: string, password: string) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: email } })

        if (existingUser) {
            throw new BadRequestException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await this.prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword
            }
        });

        return newUser;
    }
}
