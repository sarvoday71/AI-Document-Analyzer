import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private jwtservice: JwtService) { }

    async signUp(name: string, email: string, password: string) {

        const existingUser = await this.prisma.user.findUnique({ where: { email: email } })
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }


        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await this.prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword
            }
        });

        const payload = { sub: newUser.id, username: newUser.email }

        return { access_token: await this.jwtservice.signAsync(payload), };
    }


    async signIn(email: string, password: string) {

        const user = await this.prisma.user.findUnique({ where: { email: email } })
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const passwordCompare = await bcrypt.compare(password, user?.password);
        if (!passwordCompare) {
            throw new BadRequestException('Password is incorrect')
        }
        const payload = { sub: user.id, username: user.email }

        return { access_token: await this.jwtservice.signAsync(payload), };

    }
}
