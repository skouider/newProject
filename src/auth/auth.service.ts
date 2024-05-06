import { Body, ConflictException, Injectable, NotFoundException, Post, UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signupDto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'
import {compare} from 'bcrypt'
import { MailerService } from 'src/mailer/mailer.service';
import { SignInDto } from './dto/signinDto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDemandDto } from './dto/resetPasswordDemandDto';
import * as speakeasy from 'speakeasy'
import { ResetPasswordConfirmationDto } from './dto/resetPasswordConfirmaionDto';
import { DeleteAccountDto } from './dto/deleteAccountDto';

@Injectable()
export class AuthService {
    
   
    
      
    constructor(private readonly prismaService:PrismaService,
         private readonly mailService:MailerService,
         private readonly jwtService:JwtService,
         private readonly configService:ConfigService
        ){

    }
   
   async signup(signupDto: SignupDto) {

    const {username,email,password} = signupDto

    //    ** verifier si l'utilisateur existe
    const user = await this.prismaService.user.findUnique({
            where:{email}
        })

        if(user) throw new ConflictException("User already exist")

    //   ** Hasher le mot de passe

    const hash = await bcrypt.hash(password,10)
    //  ** Enregistrer l'utilisateur dans la base de donnee
    await this.prismaService.user.create({data:{username,email,password:hash}})

    // ** envoyer un email de confirmation
    await this.mailService.senSignupConfirmaion(email)
    // ** retourner une reponse de succés 
    return {data:'user succesfully created'}
    }

   async signIn(signinDto: SignInDto) {

    const {email,password} = signinDto
        // ** verifier si l'utilisateur est deja inscrit
   const user = await this.prismaService.user.findUnique({
    where:{email}
   })

    if(!user) throw new NotFoundException("User Not found ")
        // ** comparer le mot de passe

    const match = await bcrypt.compare(password, user.password)   
    
    if(!match) throw new UnauthorizedException("password does not match")

    // ** retourner un token JWT 
    const payload = {
        sub: user.userId,
        email:user.email
    }

    const token = this.jwtService.sign(payload,{expiresIn:'2h',secret: this.configService.get("SECRET_KEY")})
    
   return {
    token, user:{
        username: user.username,
        email: user.email
    }
   }
}

async resetPasswordDemand(resetPasswordDemandDto: ResetPasswordDemandDto) {
    const {email} = resetPasswordDemandDto;

    const user = await this.prismaService.user.findUnique({
        where:{email}
    })

    if(!user) throw new NotFoundException('User Not Found')

    const code = speakeasy.totp({
        secret: this.configService.get("OTP_CODE"),
        digits:5,
        step:60 * 15,
        encoding:"base32"
    })

    const url = 'http://localhost:3000/auth/reset-password-confirmation'

      await this.mailService.sendResetPassword(email,url,code)
      return {data:" Reset password mail has been sent"}    
    }

   async resetPasswordConfirmation(resetPasswordConfirmationDto: ResetPasswordConfirmationDto) {
        const {email,password,code} = resetPasswordConfirmationDto;
        const user = await this.prismaService.user.findUnique({
            where:{email}
        })
        if(!user) throw new NotFoundException("pas trouver")
            
            const match = speakeasy.totp.verify({
                secret: this.configService.get("OTP_CODE"),
                token:code,
                digits:5,
                step:60 * 15,
                encoding:"base32"
            })
            if(!match) throw new UnauthorizedException('Invalid/expire token')

                const hash = await bcrypt.hash(password,10);
                await this.prismaService.user.update({
                    where:{email},
                    data:{password:hash}
                })
            return {data: "Password Updated"}
         
    }
   async deleteAccount(userId: number, deleteAccountDto: DeleteAccountDto) {
        const {password} = deleteAccountDto;    
    const user = await this.prismaService.user.findUnique({
            where:{
                userId
            }
        })
        if(!user) throw new NotFoundException("pas trouver")
            // ** compare mot de passe
        const match = await bcrypt.compare(password, user.password)   
    
    if(!match) throw new UnauthorizedException("password does not match")
            await this.prismaService.user.delete({where:{userId}})
        return {data:"User Seccesfully deleted"}
    }
    
}
