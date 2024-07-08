import {Controller,Get,Req,Request} from '@nestjs/common'
@Controller('users')
export class UserController{
    @Get('req')
    handleRequest(){
        return 'handleRequest'
    }
}