import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authservice: AuthService) { }

    @Post('signUp')
    @HttpCode(200)
    async signUp(
        @Body('name') name: string,
        @Body('email') email: string,
        @Body('password') password: string
    ) {
        return this.authservice.signUp(name, email, password)
    }

    @Post('signIn')
    @HttpCode(200)
    async signIn(
        @Body('email') email: string,
        @Body('password') password: string
    ) {
        return this.authservice.signIn(email, password)
    }
}
