import 'reflect-metadata';
import express, { Express, Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express'
import { Logger } from "./logger";
import path from 'path'
export class NestApplication {
    //在它的内部私用化一个Express实例
    private readonly app: Express = express()
    constructor(protected readonly module) {
        this.app.use(express.json());//用来把JSON格式的请求体对象放在req.body上
        this.app.use(express.urlencoded({ extended: true }));//把form表单格式的请求体对象放在req.body
    }

    use(middleware) {
        this.app.use(middleware);
    }
    //配置初始化工作
    async init() {
        //取出模块里所有的控制器，然后做好路由配置
        const controllers = Reflect.getMetadata('controllers', this.module) || [];
        Logger.log(`AppModule dependencies initialized`, 'InstanceLoader');
        //路由映射的核心是知道 什么样的请求方法什么样的路径对应的哪个处理函数
        for (const Controller of controllers) {
            //创建每个控制器的实例
            const controller = new Controller();
            //获取控制器的路径前缀
            const prefix = Reflect.getMetadata('prefix', Controller) || '/';
            //开始解析路由
            Logger.log(`${Controller.name} {${prefix}}`, 'RoutesResolver');
            const controllerPrototype = Controller.prototype;
            //遍历类的原型上的方法名
            for (const methodName of Object.getOwnPropertyNames(controllerPrototype)) {
                //获取原型上的方法 index
                const method = controllerPrototype[methodName];
                //取得此函数上绑定的方法名的元数据
                const httpMethod = Reflect.getMetadata('method', method);//GET
                //取得此函数上绑定的路径的元数据
                const pathMetadata = Reflect.getMetadata('path', method);
                //如果方法名不存在，则不处理
                if (!httpMethod) continue;
                //拼出来完整的路由路径
                const routePath = path.posix.join('/', prefix, pathMetadata)
                //配置路由，当客户端以httpMethod方法请求routePath路径的时候，会由对应的函数进行处理
                this.app[httpMethod.toLowerCase()](routePath, (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
                    // const result = method.call(controller, req, res, next);
                    const args = this.resolveParams(controller, methodName, req, res, next);
                    
                    //执行路由处理函数，获取返回值
                    const result = method.call(controller, ...args);
                     // 判断controller的methodName方法里有没有使用Response或Res参数装饰器，如果用了任何一个则不发响应
                     const responseMetadata = this.getResponseMetadata(controller, methodName);
                     // 如果没有注入Response参数装饰器，则nestjs内部响应
                     if (!responseMetadata || (responseMetadata?.data?.passthrough)) {
                         // 把返回值序列化发回给客户端
                         res.send(result);
                    } 
                    // 如果有注入Response参数装饰器，则不发响应, 由用户自己处理返回响应
                })
                Logger.log(`Mapped {${routePath}, ${httpMethod}} route`, 'RoutesResolver');
            }

        }
        Logger.log(`Nest application successfully started`, 'NestApplication');
    }
    private getResponseMetadata(controller, methodName) {
        const paramsMetaData = Reflect.getMetadata(`params`, controller, methodName) ?? [];
        return paramsMetaData.filter(Boolean).find((param) =>
            param.key === 'Response' || param.key === 'Res');
    }
    private resolveParams(instance: any, methodName: string, req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
        //获取参数的元数据
        // 只有经过装饰器装饰的参数才会放到里面来(通过createParamDecorator创建的参数装饰器，那么没有被参数装饰器装饰的其他的参数怎么处理呢？)
        const paramsMetaData = Reflect.getMetadata(`params`, instance, methodName) ?? [];
        
        //[{ parameterIndex: 0, key: 'Req' },{ parameterIndex: 1, key: 'Request' }]
        //此处就是把元数据变成实际的参数
        return paramsMetaData.map((paramMetaData) => {
            const { key, data } = paramMetaData;
            switch (key) {
                case "Request":
                case "Req":
                    return req;
                case "Response":
                case "Res":
                    return res;
                case 'Session':
                    return req.session;
                case 'Param':
                    return data ? req.params[data] : req.params;
                case 'Body':
                    return data ? req.body[data] : req.body;
                case 'Query':
                    return data ? req.query[data] : req.query;
                case "Headers":
                    return data ? req.headers[data] : req.headers;
                case "Ip":
                    return req.ip;
                case "HostParam":
                    return req.host;
                default:
                    return null;
            }
        })
        //[req,req]
    }
    //启动HTTP服务器
    async listen(port) {
        await this.init();
        //调用express实例的listen方法启动一个HTTP服务器，监听port端口
        this.app.listen(port, () => {
            Logger.log(`Application is running on http://localhost:${port}`, 'NestApplication');
        });
    }
}