import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { SignupDto } from './dto/signupDto';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signinDto';
import { ResetPasswordDemandDto } from './dto/resetPasswordDemandDto';
import { ResetPasswordConfirmationDto } from './dto/resetPasswordConfirmaionDto';
import { AuthGuard } from '@nestjs/passport';
import { request } from 'http';
import { Request } from 'express';
import { DeleteAccountDto } from './dto/deleteAccountDto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService:AuthService){

    }

    @Post('signup')
    signUp(@Body() signupDto:SignupDto){
        return this.authService.signup(signupDto)
    }

    @Post('signin')
    signin(@Body() signinDto:SignInDto){
      return this.authService.signIn(signinDto);
    }

    @Post('reset-password')
    resetPasswordDemand(@Body() resetPasswordDemand:ResetPasswordDemandDto){
      return this.authService.resetPasswordDemand(resetPasswordDemand);
    }

    @Post('reset-password-confirm')
    resetPasswordConfirmation(@Body() resetPasswordConfirmationDto:ResetPasswordConfirmationDto){
      return this.authService.resetPasswordConfirmation(resetPasswordConfirmationDto);
    }

    @UseGuards(AuthGuard("jwt"))
    @Delete('delete')
    deleteAccount(@Req() request:Request, @Body() deleteAccountDto:DeleteAccountDto){

        const userId = request.user["userId"]
        return this.authService.deleteAccount(userId,deleteAccountDto);
    }
}

