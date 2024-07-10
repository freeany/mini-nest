import { Controller, Get, Request, Req, Aaa, Bbb } from '@nestjs/common'


@Controller()
export class AppController {
    //使用Get装饰器标记index方法为HTTP GET路由处理程序
    @Get()
    index(){
        return 'hello'
    }
    @Get('info')
    main(@Request() req1, @Req() req2, @Aaa() aaa, @Bbb() bbb){
        console.log(req1,'req11111111111111');
        return 'info'
    }
};