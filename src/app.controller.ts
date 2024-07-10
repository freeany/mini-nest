import { Controller, Get, Request, Req, Res, Session } from '@nestjs/common'


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
};