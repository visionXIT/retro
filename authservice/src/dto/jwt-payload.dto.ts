import {IsEmail, IsNumber, IsString} from "class-validator";

export class JwtPayloadDto {
    @IsNumber()
    userId: number;

    @IsString({message: 'Должно быть строкой'})
    login?: string;

    @IsString({message: 'Должно быть строкой'})
    @IsEmail({}, {message: 'Некорректный email'})
    email?: string;

    @IsString({message: 'Должно быть строкой'})
    role: string;
}
