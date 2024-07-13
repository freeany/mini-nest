import { Controller, Get, Request, Req, Res, Session, Param, Post, Body, Query, Headers,  HostParam, Ip, Next, HttpCode, Header } from '@nestjs/common'

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

    @Get('headers')
    getHeaders(@Headers() headers, @Headers('authorization') authorization): string {
        console.log(headers);
        return `This action returns a #${headers.authorization}--${authorization}`;
    }

    @Get('ip-host')
    getIpHost(@Ip() ip, @HostParam() host): string {
        return `This action returns a #${ip}--${host}`;
    }

    @Get('passthrough')
    passthroughHandle(@Res({passthrough: true}) res, @Headers('authorization') authorization): string {
        console.log(res, 'res.....');
        return `This action returns ${authorization}`
    }

    @Get('next')
    nextHandle1(@Next() next) {
        console.log(1111);
        next()
    }

    @Get('next')
    nextHandle2(): string {
        return `nextHandle2 next`
    }

    @Post('addCat')
    @HttpCode(200)
    create(): string {
        return 'This action adds a new cat';
    }

    @Get('header')
    @Header('Content-Type', 'application/xml') 
    getXmlData(): string {
        return '<data>Some XML data here</data>';
    }
    
    @Get(':id')
    findOne(@Param() param, @Param('id') id): string {
        return `This action returns a #${param.id} cat ${id}`;
    }
};