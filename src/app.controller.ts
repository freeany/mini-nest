import { Controller, Get, Request, Req, Res, Session, Param, Post, Body, Query } from '@nestjs/common'

class CreateCatDto {
    name: string;
    age: number;
    breed: string;
}
  
@Controller()
export class AppController {
    //使用Get装饰器标记index方法为HTTP GET路由处理程序
    @Get()
    index(){
        return 'hello'
    }
    @Get('res')
    main(@Res() res) {
        res.send('res decorator.... ')
        return 'info'
    }

    @Get('session')
    // @Session('pageView') pageView:string
    sessionTest(@Session() session){
        console.log('session',session);
        // console.log('pageView',pageView);
        if(session.pageView){
            session.pageView++;
        }else{
            session.pageView=1;
        }
        return `pageView:${session.pageView}`;
    }

    @Post('add')
    addUser(@Body() user: CreateCatDto): any {
        console.log(user,'body');
        return "add user"
    }

    @Get('query')
    userQuery(@Query() query, @Query('name') name): string {
        console.log(query);
        return `This action returns a #${query.name}--${name}`;
    }
    
    @Get(':id')
    findOne(@Param() param, @Param('id') id): string {
        return `This action returns a #${param.id} cat ${id}`;
    }
};