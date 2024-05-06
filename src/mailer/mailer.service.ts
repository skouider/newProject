import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailerService {

   private async transporter(){

    const testAccount = await nodemailer.createTestAccount();
    const transporrt = await nodemailer.createTransport({
        host:"localhost",
        port:1025,
        ignoreTLS:true,
        auth:{
            user:testAccount.user,
            pass:testAccount.pass
        }
    })
    return transporrt;
   }

   async senSignupConfirmaion(usermail:string){
   (await this.transporter()).sendMail({
    from:'app@localhost.com',
    to:usermail,
    subject:'inscription',
    html:"<h2>Confirmation d'inscription </h2>"

   })
   }

   async sendResetPassword(usermail:string,url:string,code:string){
    (await this.transporter()).sendMail({
     from:'app@localhost.com',
     to:usermail,
     subject:'Reset Password',
     html:`<a href:"${url}">Reset Password </a>
     <p> Secret Code <strong>${code}</strong></p>
     <h2>Code will expire in 15mn </h2>`
     
 
    })
    }
}
