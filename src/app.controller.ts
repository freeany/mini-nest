import { Controller, Get, Request, Req, Res } from '@nestjs/common'


@Controller()
export class AppController {
    //使用Get装饰器标记index方法为HTTP GET路由处理程序
    @Get()
    index(){
        return 'hello'
    }
    @Get('info')
    main(@Req() req, aa: string, @Req() req1, @Res() res) {
        res.send('hello1111')
        return 'info'
    }
};