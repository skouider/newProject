import { IsEmail, IsNotEmpty } from "class-validator"

export class ResetPasswordConfirmationDto{

    @IsNotEmpty()
    @IsEmail()
    readonly email:string
    @IsNotEmpty()
    readonly password:string
    readonly code: string
}