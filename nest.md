## 安装nest项目的npm包

`pnpm i --save @nestjs/core @nestjs/common rxjs reflect-metadata @nestjs/platform-express `

`npm i -g ts-node`

| 包名                     | 介绍                                                         |
| :----------------------- | :----------------------------------------------------------- |
| @nestjs/core             | NestJS 框架的核心模块，提供构建、启动和管理 NestJS 应用程序的基础设施。 |
| @nestjs/common           | 包含构建 NestJS 应用的基础设施和常用装饰器、工具类、接口等，用于定义控制器、服务、中间件、守卫、拦截器、管道、异常过滤器等。 |
| rxjs                     | 用于构建异步和事件驱动程序的库，基于可观察序列的概念，提供强大的功能来处理异步数据流。 |
| reflect-metadata         | 在 JavaScript 和 TypeScript 中实现元编程的库，通过提供元数据反射 API，允许在运行时检查和操作对象的元数据。 |
| @nestjs/platform-express | NestJS 的平台适配器，用于将 NestJS 应用与 Express.js 集成，提供 Express.js 的中间件、路由等功能，并享受 NestJS 的模块化、依赖注入等高级特性。 |
| ts-node                  | 是一个用于直接执行 TypeScript 代码的 Node.js 实现，它允许开发者在不预先编译的情况下运行 TypeScript 文件 |



初始化tsconfig.json文件

`tsc --init`

```json
{
  "compilerOptions": {
    
    "target": "ES2021",                                  /* 设置目标编译的es版本 */                            
    "experimentalDecorators": true,                   	 /* 启用实验性的装饰器特性。 */
   
    "module": "NodeNext",                                /* 设置生成什么模块类型的代码 */
    
    "esModuleInterop": true,                             /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */
    
    "forceConsistentCasingInFileNames": true,            /* Ensure that casing is correct in imports. */

    
    "strict": true,                                      /* Enable all strict type-checking options. */
    
    "skipLibCheck": true                                 /* Skip type checking all .d.ts files. */
  }
}
```





# 实现nestjs中的注册路由

## 实现Controller

控制器负责处理传入的请求并向客户端返回响应。

![img](https://docs.nestjs.com/assets/Controllers_1.png)

控制器的目的是接收应用程序的特定请求。控制哪个控制器接收哪些请求。这里的请求也可以指路由，每个控制器都有多个路由，不同的路由可以执行不同的操作，作不同的处理。

在nestjs中使用`@Controller()`类装饰器标识这个类是一个控制器，将路由绑定到相应的类方法中。

`app.controller.ts`

```ts
@Controller()
export class AppController{
    //使用Get装饰器标记index方法为HTTP GET路由处理程序
    @Get('hello')
    index(){
        return 'hello'
    }
}
```

Controller并不能直接挂载到nest的app应用程序上，它是挂载到`Module`装饰器上作为一个属性，然后`Module`l装饰的类通过参数传递到nest的`NestApplication`的根应用实例上。完成路由的注册。

![img](https://docs.nestjs.com/assets/Modules_1.png)

挂载多个路由器(controller)

`app.module.ts`

```ts
import { Module } from "@nestjs/common";
import { AppController } from './app.controller';
import { UserController } from './user.controller';
@Module({
    controllers: [AppController,UserController]
})
export class AppModule {}
```

在`main.ts`中根据Module创建根应用实例

```ts
import { NestFactory } from "@nestjs/core";
import {AppModule} from './app.module';
async function bootstrap(){
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
}
bootstrap();
```

## 实现`Module`装饰器

给AppModule的元数据定义的controllers，方便后续使用。

```ts
export function Module(metadata:ModuleMetadata):ClassDecorator{
    return (target:Function)=>{
      // 给类添加元数据AppModule, key是"controllers",值是传入的controllers
      Reflect.defineMetadata('controllers', metadata.controllers, target);
    }
}
```

现在可以通过AppModule的元数据获取到定义的controllers。

## 实现controller装饰器

通过重写Controller方法，实现多种情况(没参数、参数是string、参数是Object)。

最后的目的是： 给控制器类添加prefix路径前缀的元数据，方便后续获取

```ts
import 'reflect-metadata';
interface ControllerOptions {
    prefix?: string
}
//其实可能给Controller传递路径路径前缀
//前缀前缀可以为空,也可写成空串，也可以写一个非空字符串，也可能写成一个对象
export function Controller(): ClassDecorator//传空串
export function Controller(prefix: string): ClassDecorator//路径前缀
export function Controller(options: ControllerOptions): ClassDecorator//传递对象
export function Controller(prefixOrOptions?: string | ControllerOptions): ClassDecorator {
    let options: ControllerOptions = {}
    if (typeof prefixOrOptions === 'string') {
        options.prefix = prefixOrOptions
    } else if (typeof prefixOrOptions === 'object') {
        options = prefixOrOptions;
    }
    //这是一个类装饰器，装饰的控制器这个类
    return (target: Function) => {
        //给控制器类添加prefix路径前缀的元数据
        Reflect.defineMetadata('prefix',options.prefix||'',target);
    }
}
```

## 实现Get装饰器

appController类中的每个方法都可以作为一个个路由，不同的路由可以执行不同的操作，作不同的处理。但是前提是要标识是get请求还是post请求，还是其他类型的请求，这里简单实现下get请求的装饰器。

在Get装饰器的函数上，绑定了`path`和`method`的元数据，方便后续注册路由的时候获取。

```ts
import 'reflect-metadata';

export function Get(path:string=''):MethodDecorator{
  /**
   * target 类原型 AppController.prototype
   * propertyKey方法键名 
   * descriptor 方法的属性描述器， descriptor.value是函数本身
   */
  return (target:any,propertyKey:string,descriptor:PropertyDescriptor)=>{
    //给descriptor.value，也就是函数添加元数据
    Reflect.defineMetadata('path',path,descriptor.value);
    //给descriptor.value，也就是函数添加元数据
    Reflect.defineMetadata('method','GET',descriptor.value);
  }
}
```



## 注册路由

现在`Module`装饰器定义好了，`Controller`装饰器也定义好了，都分别用到了Module类和Controller类上，现在在类的元数据上分别有了传入的controllers和每个controller对应的prefix。现在可以注册路由了。

在`NestApplication`类初始化的时候**取出模块里所有的控制器，然后做好路由配置**。

1. 在传入的module中取出传入的controllers，这里就用到了元数据

​	` const controllers = Reflect.getMetadata('controllers', this.module) || [];`

2. 循环获取到的控制器，创建每个控制器的实例

```ts
for (const Controller of controllers) {
    // 创建每个控制器的实例
    const controller = new Controller();
    // 获取控制器的路径前缀
    const prefix = Reflect.getMetadata('prefix', Controller) || '/';
}
```

3. 此时每个循环中的controller都是类的实例对象。下面要做的事就是要把类中的方法都注册好路由，可以处理相应的http请求。

```ts
const controllerPrototype = Controller.prototype;
// 遍历类的原型上的方法名
for (const methodName of Object.getOwnPropertyNames(controllerPrototype)) {
    //获取原型上的方法 
    const method = controllerPrototype[methodName];
    //取得此函数上绑定的方法名的元数据
    const httpMethod = Reflect.getMetadata('method', method);//GET
    //取得此函数上绑定的路径的元数据
    const pathMetadata = Reflect.getMetadata('path', method);
    //如果方法名不存在，则不处理
    if (!httpMethod) continue;
    //拼出来完整的路由路径
    const routePath = path.posix.join('/', prefix, pathMetadata)
    // 注册路由，当客户端以httpMethod方法请求routePath路径的时候，会由对应的函数进行处理
    this.app[httpMethod.toLowerCase()](routePath, (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
        const args = this.resolveParams(controller, methodName, req, res, next);
        const result = method.call(controller, req, res, next);
        res.send(result);
    })
}
```

- `path.posix`拼出来一个url路径，能处理很多边界情况。
- `this.app`是`express`实例。

​	` private readonly app: Express = express()`。

- 如果没有在方法名上使用装饰器(`@Get()等...`)装饰，那么就不作路由映射的处理。也不注册路由。

现在我们将Controller路径前缀("/user")与装饰器 @Get传递的路径("getInfo") 结合将为 GET /user/getInfo等请求生成路由映射。

## 总结

GitHub：https://github.com/freeany/mini-nest/commit/e7e700a2d4fbc74c35fdd9e7435b9ddfcc73eda5



## 实现`@Req`装饰器

服务端接口接收客户端访问的时候，有时候会需要获取到客户端请求的详细信息。nestjs提供了@Req() 装饰器修饰方法参数，nest会自动把请求对象注入进去。

```ts
@Get('info')
main(@Request() req) {
    console.log(req)
    return 'info'
}
```

当访问`/info`路由时，通过`@Request`装饰器获取到了req对象。

<img src="https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240709103107239.png" alt="image-20240709103107239" style="zoom:50%;" />

在nest中，@Req和@Request是等价的，而且nest的参数装饰器还有很多。所以我们创建一个参数装饰器的工厂函数。然后根据工厂函数创建出我们想要的参数装饰器。如@Requst、@Response

```ts
import 'reflect-metadata';
export const createParamDecorator = (key: string) => {
    // target: Controller类的原型对象  
    // propertyKey：参数所属的方法的名称  
    // parameterIndex: 参数在参数列表中的索引
    return () => (target: any, propertyKey: string, parameterIndex: number) => {   
        // 因为通过装饰器修饰的参数可能会有多个，一个个保存
        const existingParameters = Reflect.getMetadata(`params`,target,propertyKey)||[];
        existingParameters.unshift({ parameterIndex, key });
        
        // 将解析后的参数数组放到Controller类的方法上。从这个方法就能拿到数据。
        Reflect.defineMetadata(`params`, existingParameters, target, propertyKey);
    }
}
export const Request = createParamDecorator('Request');
export const Req = createParamDecorator('Req');
export const Aaa = createParamDecorator('Aaa');
export const Bbb = createParamDecorator('Bbb');
```

假如我们创建这样一个路由函数

```ts
main(@Request() req1, @Request() req2, @Aaa() aaa, @Bbb() bbb){
   return 'info'
}
```

将上面的参数装饰器解析为：

```ts
[
  { parameterIndex: 0, key: 'Request' },
  { parameterIndex: 1, key: 'Request' },
  { parameterIndex: 2, key: 'Aaa' },
  { parameterIndex: 3, key: 'Bbb' },
]
```

参数装饰器的执行顺序是从右到左。但是我们在参数装饰器逻辑里面处理的时候是unshift，所以是0、1、2、3。

参数装饰器创建好了，创建的代码也都看明白了，那么我们重新捋一下逻辑，我们的目的是使用`@Request`/`@Req`装饰器装饰一个参数后，这个参数的值就是req请求对象。

```ts
 main(@Request() req1, @Req() req2, @Aaa() aaa, @Bbb() bbb){
    console.log(req1,'req11111111111111'); // 拿到的时候req请求对象
    console.log(aaa,'aaaaaa');
    console.log(bbb,'bbbbbb');
    return 'info'
}
```

所以在访问这个路由调用路由对应的方法时，要把参数处理好然后再放进去。

创建一个resolveParams函数用来解析好参数对象，然后使用call方法把参数传进去。

<img src="https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240709144947074.png" alt="image-20240709144947074" style="zoom:50%;" />



resolveParams函数

```ts
private resolveParams(instance: any, methodName: string, req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    //获取参数的元数据
    const paramsMetaData = Reflect.getMetadata(`params`, instance, methodName) ?? [];
    //[{ parameterIndex: 0, key: 'Req' },{ parameterIndex: 1, key: 'Request' }]
    //此处就是把元数据变成实际的参数
    return paramsMetaData.map((paramMetaData) => {
        const { key } = paramMetaData;
        switch (key) {
            case "Request":
            case "Req":
                return req;
            default:
                return null;
        }
    })
    //[req,req]
}
```

现在访问`http://localhost:3000/info`， nest会自动调用main函数，使用`@Request()`/`@Req`装饰的参数拿到的值就是req请求对象了。

![image-20240709145323013](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240709145323013.png)



## 修复bug

当使用nestjs时，在类中定义一个路由方法

```ts
import { Controller, Get, Request, Req, Res } from '@nestjs/common'


@Controller()
export class AppController {
    //使用Get装饰器标记index方法为HTTP GET路由处理程序
    @Get()
    index(){
        return 'hello'
    }
    @Get('info')
    main(@Req() req, aa: string, @Req() req1) {
        console.log(aa,'aa...');
        console.log(req1,'req1...');
        return 'info'
    }
};
```

访问info路由，打印出的变量为

<img src="https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240710113417138.png" alt="image-20240710113417138" style="zoom:50%;" />

`aa`变量变成了request对象，req1为undefined。这是为啥呢？

原因是我们在定义`params`元数据的时候，使用了unshift，只有使用参数装饰器的参数才会使用`Reflect.defineMetadata(`params`, existingParameters, target, propertyKey)`被放到元数据中, 但是 aa形参没有使用参数装饰器修饰，那么没有被参数装饰器修饰的参数该怎么处理呢？

![image-20240710113641163](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240710113641163.png)

使用索引将数据放到`existingParameters`变量中，因为参数装饰器是从右到左执行的，所以第一次赋值的时候，就会确定`existingParameters`的长度。

<img src="https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240710133518766.png" alt="image-20240710133518766" style="zoom:50%;" />

现在参数就能一一对应起来了。

## 实现 @Res装饰器

在方法处理器中如果注入了@Res装饰器时，那么这个路由的响应就需要使用者手动来返回响应，手动使用res.json(...) 或 res.send(...)来返回响应，如果使用者没有手动返回响应，那么HTTP服务器会被挂起。

创建@Response装饰器

```ts
export const Response = createParamDecorator('Response');
export const Res = createParamDecorator('Res');
```

<img src="https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240710135418378.png" alt="image-20240710135418378" style="zoom:50%;" />

在init函数中处理

```ts
const result = method.call(controller, ...args);
// 判断controller的methodName方法里有没有使用Response或Res参数装饰器，如果用了任何一个则不发响应
const responseMetadata = this.getResponseMetadata(controller, methodName);
// 如果没有注入Response参数装饰器，则nestjs内部响应
if (!responseMetadata) {
     // 把返回值序列化发回给客户端
     res.send(result);
} 
// 如果有注入Response参数装饰器，则不发响应, 由用户自己处理返回响应
```

```ts
private getResponseMetadata(controller, methodName) {
    const paramsMetaData = Reflect.getMetadata(`params`, controller, methodName) ?? [];
    return paramsMetaData.filter(Boolean).find((param) =>
        param.key === 'Response' || param.key === 'Res');
}
```

在元数据处理成实际的参数的时候，加上Response和Res

<img src="https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240710140102736.png" alt="image-20240710140102736" style="zoom:50%;" />



## 实现@Session装饰器

在`param.decorator.ts`中创建Session装饰器

```ts
export const Session = createParamDecorator('Session');
```

在处理参数元数据时，添加Session选项

```ts
case 'Session':
     return req.session;
```

使用session要借助`express-session`这个库

```ts
import { NestFactory } from "@nestjs/core";
import session from 'express-session';

import {AppModule} from './app.module';
async function bootstrap(){
    const app = await NestFactory.create(AppModule);
    app.use(session({
        secret:'your-secret-key', // 用于加密会话的密钥
        resave:false, // 在每次请求结束后是否强制保存会话，即使它没有改变
        saveUninitialized:false, // 是否保存未初始化的会话
        cookie:{maxAge:1000 * 60 * 60 * 24} // 定义会话的cookie配置，设置cookie的最大存活时间是一天
    }));
    await app.listen(3000);
}
```

`NestApplication`类中添加`use`方法。

```ts
use(middleware) {
	this.app.use(middleware);
}
```



## 实现@Param装饰器

​	客户端请求的url一般都是静态，但是如果需要接收动态数据作为请求的一部分时，可以使用带参数的路由。

例如：`GET /article/1 ` 获取id为1的文章详情。这个id就是动态的。

​	首先要在路由的路径中添加路由参数标记，路由参数标记可以捕获请求 URL 中该位置的动态值。然后使用`@Param()`装饰器获取到对应的路由参数。

> 这种带参数的动态路由要在所有的静态路径之后声明。因为动态路由会拦截同样路径的请求url。



app.controller.ts

放到最后

```ts
@Get(':id')
findOne(@Param() param): string {
    return `This action returns a #${param.id} cat`;
}
```

param.decorator.ts 创建Param装饰器

```ts
export const Param = createParamDecorator('Param');
```

在switch逻辑中加入Param条件分支

<img src="https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240710171455515.png" alt="image-20240710171455515" style="zoom:50%;" />

但是在nestjs中，@Param装饰器是可以传入参数的。

```ts
@Param(key?: string)
// 获取到req.params / req.params[key]
```

实现传参并获取到参数对应的数据要改下元数据变成实际的参数这里的逻辑

![image-20240710182439832](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240710182439832.png)

![image-20240710182450715](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240710182450715.png)

![image-20240710182504712](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240710182504712.png)

访问`/:id`路由

![image-20240710182559965](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240710182559965.png)

## 实现@Body装饰器

@Body装饰器的作用是在Post请求中获取到请求的参数然后将参数转为JavaScript对象，nestjs使用了DTO(Data Transfer Object)架构，DTO定义客户端请求过来的载荷的类型，建议使用类来创建DTO对象，因为TypeScript 接口在转译过程中被删除，无法在运行时引用它们，但是类是 JavaScript ES6 标准的一部分，编译后的 JavaScript还会再代码中被保存。而且使用类定义DTO，方便后续对类中字段设置默认值，进行校验，加密操作，或者过滤掉某些字段这些非常常用的功能。



在实现@Body装饰器之前要实现@Post装饰器

```ts
// 实现Post请求注解
export function Post(path:string=''):MethodDecorator{
  /**
   * target 类原型 AppController.prototype
   * propertyKey方法键名 index
   * descriptor index方法的属性描述器
   */
  return (target:any,propertyKey:string,descriptor:PropertyDescriptor)=>{
    //给descriptor.value，也就是index函数添加元数据，path=path
    Reflect.defineMetadata('path',path,descriptor.value);
    //descriptor.value.path = path;
    //给descriptor.value，也就是index函数添加元数据，method=GET
    Reflect.defineMetadata('method','POST',descriptor.value);
    //descriptor.value.method = 'GET'
  }
}
```

现在就可以创建Post请求的接口了

然后开始实现@Body装饰器及其逻辑



创建Body参数装饰器

<img src="https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240710182817397.png" alt="image-20240710182817397" style="zoom:50%;" />

给switch添加新的分支

<img src="https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240710182846822.png" alt="image-20240710182846822" style="zoom:50%;" />



创建DTO类

```ts
class CreateCatDto {
    name: string;
    age: number;
    breed: string;
}
```



app.controller.ts

```ts
@Post('add')
addUser(@Body() user: CreateCatDto): any {
    console.log(user,'body');
    return "add user"
}
```

现在还不行，因为当客户端通过 HTTP 请求（如 POST、PUT 等）发送 JSON 数据时，服务器需要能够正确地解析这些数据，这样才能在后续的处理中使用。`express.json()` 中间件的作用就是自动解析请求体中的 JSON 数据，并将其转换为 JavaScript 对象，这样就能够在路由处理函数中通过 `req.body` 获取和处理这些数据。

如果没有使用 `express.json()` 中间件，就需要手动处理(非常繁琐)。

在NestApplication初始化的时候添加`express.json` 和 `express.urlencoded`中间件:

`({ extended: true })` 是处理深层嵌套对象。 

![image-20240710183140680](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240710183140680.png)

现在发送Post请求add，客户端携带数据，就可以通过@Body装饰器拿到了客户端发送的数据并转换成了JavaScript对象。

![image-20240710183543906](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240710183543906.png)





## 实现@Query装饰器

@Query参数可以用来获取 GET 请求中的查询参数，也就是方便的获取 URL 中 `?` 后面的参数。

客户端访问服务器：

`http://localhost:3000/query?name=zhangsan&age=18&sex=1`, 在代码中通过@Query装饰器拿到

`{ name: 'zhangsan', age: '18', sex: '1' }`对象。



在param.decorator.ts中新增Query参数装饰器

![image-20240712162729081](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712162729081.png)

nest-application.ts中新增Query分支

![image-20240712162813138](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712162813138.png)

在app.controller.ts中测试使用Query装饰器

![image-20240712162108327](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712162108327.png)



```ts
@Get('query')
userQuery(@Query() query, @Query('name') name): string {
    console.log(query);
    return `This action returns a #${query.name}--${name}`;
}
```

在浏览器端显示接口的响应：

![image-20240712162313930](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712162313930.png)



## 实现@Headers装饰器

@Headers装饰器可以获取请求头中的特定字段或所有请求头数据，并将其作为方法的参数进行处理。

在param.decorator.ts中新增Headers参数装饰器

![image-20240712164408789](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712164408789.png)

nest-application.ts中新增Query分支

![image-20240712164357012](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712164357012.png)

在app.controller.ts中测试使用Headers装饰器

![image-20240712164337851](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712164337851.png)



```ts
@Get('headers')
getHeaders(@Headers() headers, @Headers('authorization') authorization): string {
    console.log(headers);
    return `This action returns a #${headers.authorization}--${authorization}`;
}
```

响应结果：

![image-20240712164255764](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712164255764.png)





## 实现@Ip和@HostParam装饰器

@Ip和@HostParam装饰器分别是i获取请求ip和请求主机，这些数据在req对象中都可以获取到，但是nestjs帮我们提供了这两个开箱即用的装饰器，下面来看看如何实现。

在param.decorator.ts中新增Ip和HostParam参数装饰器

![image-20240712165923123](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712165923123.png)

nest-application.ts中新增Ip和HostParam分支

![image-20240712165958624](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712165958624.png)

在app.controller.ts中测试使用装饰器

![image-20240712170034916](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712170034916.png)

```ts
@Get('ip-host')
getIpHost(@Ip() ip, @HostParam() host): string {
	return `This action returns a #${ip}--${host}`;
}
```

响应结果：

![image-20240712170052734](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712170052734.png)

>  `::1` 是 IPv6 中的本地环回地址，它类似于 IPv4 中的 `127.0.0.1`，表示本地主机。



## 实现@Next参数装饰器



现在我们就实现了nestjs官网上列出的所有参数装饰器，并能正常运行。

![](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712174028716.png)

但是有一些细节还需要继续优化下：

1. 在我们前面实现的@Res功能中，如果使用了该装饰器，那么就需要自己手动去返回响应，而且@Header() / @HttpCode()这些装饰器都不能用了，因为这些装饰器史与响应相关的，但是在很多情况下，我们想获取到response对象，但是不想自己返回响应，想让nestjs自动帮我们将return的结果响应出去，而且也可以正常使用@Header() / @HttpCode()这些装饰器, 在这里给我们提供了`{ passthrough: true }`参数。加入这个参数后，我们就可以获取到response响应对象了，其他的工作继续留给框架处理。



实现passthrough功能

在`nest-application.ts`中修改这一行代码即可

![image-20240712180219269](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712180219269.png)

在app.controller.ts中加入测试路由

![image-20240712180259202](https://gitee.com/freeanyli/pic2forcompany/raw/master/images/image-20240712180259202.png)



## 实现@HttpCode方法装饰器



## 实现@Header方法装饰器

response.setHeader



## 实现@Redirect方法装饰器



## 实现自定义装饰器

User



























# 《深入理解装饰器》

装饰器就是一个函数，通过装饰器能够扩展代码的功能但是不修改代码。nestjs的很大一部分功能都是由装饰器实现的。

装饰器的缺点也很明显，它会让代码实现的细节被隐藏，让代码逻辑变的黑盒，会让结果变得难以理解。但是装饰器填补了javascript元编程能力的空白。虽然装饰器的提供的功能也可以通过辅助函数来实现，但是会让代码的设计和结构乱糟糟的，非常不合理。

功能：给类成员函数添加日志记录的功能

```ts
function log(target:Object,propertyKey:string,descriptor:PropertyDescriptor){
  //获取老的函数
 const originalMethod = descriptor.value;
 //重定原型上的属性
  descriptor.value = function (...args: any[]) {
  console.log(`调用方法${propertyKey}，记录下日志`, 'dosomething....');
  const result = originalMethod.apply(this,args);
  return result;
 }
}

class User{
  @log
  changeUserPwd() {
    // 修改密码
    return true
  }
  @log
  changeUserName() {
    // 修改姓名
    return true
  }
}
const user = new User();
user.changeUserPwd();
user.changeUserName();
```

辅助函数的方式：

```ts
function log(fn: Function){
  //获取老的函数
  console.log(`调用方法${fn.name}，记录下日志`, 'dosomething....');
  const result = fn();
  return result;
}
class User{
  changeUserPwd() {
    // 修改密码
    return true
  }
  changeUserName() {
    // 修改姓名
    return true
  }
}
const user = new User();
log(user.changeUserPwd)
log(user.changeUserName);
```

辅助函数的方式让log函数与类方法进行分离。不是声明式的。想要给记录日志，还要调用下log方法，如果是装饰器的方式就可以直接调用user的`changeUserPwd`方法，方法内部会自动调用装饰器，这样就一步到位了，在定义的时候就决定了这个方法被调用时就要记录下日志。

装饰器最大作用就是可用于元编程，并为装饰的类型添加或改变功能，而不用通过外部行为来添加/修改功能。



###  装饰器是js的还是ts的，傻傻分不清

装饰器是js语法，但是目前还是提案阶段，装饰器提案已经五年了， 目前已经到了<a href="https://github.com/tc39/proposal-decorators">第三阶段</a>, 因为是提案阶段，所以在浏览器环境或者node环境下是不识别装饰器语法的。

<img src="https://gitee.com/freeanyli/picture/raw/master/image-20240707125505731.png" alt="image-20240707125505731" style="zoom:50%;" />



所以如果我们想要使用装饰器则可以用babel或者TypeScript 的编译器tsc来编译装饰器语法，这样就可以在浏览器或者node环境中使用了。



### 装饰器的类型

我们使用typescript编译器来编译装饰器语法（在tsconfig文件中启用`experimentalDecorators`）。

1. **类装饰器（Class Decorators）**：应用于类构造函数，可以用于修改类的定义。
2. **方法装饰器（Method Decorators）**：应用于方法，可以用于修改方法的行为。
3. **访问器装饰器（Accessor Decorators）**：应用于类的访问器属性（getter 或 setter）。
4. **属性装饰器（Property Decorators）**：应用于类的属性。
5. **参数装饰器（Parameter Decorators）**：应用于方法参数。



#### 类装饰器

- 简单类装饰器

  参数是类本身

```ts
function logClass(constructor: Function) {
    console.log("Class created:", constructor.name);
}

@logClass
class Person {
    constructor(public name: string) {}
}

// 输出: Class created: Person
```

- ##### 类装饰器工厂 

返回装饰器函数

```ts
function logClassWithParams(message: string) {
    return function (constructor: Function) {
        console.log(message, constructor.name);
    };
}

@logClassWithParams("Creating class:")
class Car {
    constructor(public model: string) {}
}

// 输出: Creating class: Car
```

- ##### 修改类的行为

扩展/修改类的属性

```ts
function addTimestamp<T extends { new(...args: any[])>(constructor: T) {
    return class extends constructor {
        timestamp = new Date();
    };
}

// 合并声明
interface Document{
    timestamp: Date;
}
@addTimestamp
class Document {
    constructor(public title: string) {}
}

const doc = new Document("My Document");
//const doc = new Document("My Document") as Document & { timestamp: Date };
console.log(doc.title); // My Document
console.log(doc.timestamp); // 当前日期和时间
export {}
```

扩展/修改类的构造函数

```ts
function replaceConstructor<T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
        constructor(...args: any[]) {
            super(...args);
            console.log("Instance created");
        }
    };
}

@replaceConstructor
class User {
    constructor(public name: string) {}
}

const user = new User("Alice");
// 输出: Instance created
```

- 类装饰器还可以重写类方法

```ts
function aa(target: new (...args: any) => any) {
	return class extends target {
		eat() {
			super.eat() // 调用target类的eat方法，不写这行也行
			console.log('子类 eat方法')
		}
	}
}

@aa
class Animal {
	eat() {
		console.log('父类eat方法')
	}
}

const animal = new Animal()
console.log(animal)
animal.eat()
```

`animal.eat()`调用的是重写后的方法。

缺点：重写后的原来类本身的方法无法用类实例访问了。

#### 方法装饰器

函数是javascript的一等公民，方法装饰器的功能非常强大，方法装饰器可以修改原方法的行为、添加元数据、日志记录、权限检查等。

方法装饰器是一个接受三个参数的函数：

1. **`target`**：装饰的目标对象，对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
2. **`propertyKey`**：装饰的成员名称。
3. **`descriptor`**：成员的属性描述符。

- 日志记录

```ts
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
        console.log(`Calling ${propertyKey} with arguments: ${args}`);
        const result = originalMethod.apply(this, args);
        console.log(`Result: ${result}`);
        return result;
    };
    return descriptor;
}
class Calculator {
    @log
    add(a: number, b: number): number {
        return a + b;
    }
}

const calc = new Calculator();
calc.add(2, 3);
```

- ##### 权限检查 

```ts
//可以在方法调用前检查 用户的权限，决定是否可以调用
let users = {
  '001':{roles:['admin']},
  '002':{roles:['member']}
}
function authorize(target:any,propertyKey:string,descriptor:PropertyDescriptor){
//获取老的函数
 const originalMethod = descriptor.value;
 //重定原型上的属性
 descriptor.value = function(roleId: keyof typeof users){
    let user = users[roleId]
    if(user&&user.roles.includes('admin')){
      originalMethod.apply(this,[roleId])
    }else{
      throw new Error(`User is not authorized to call this method`)
    }
 }
 return descriptor;
}

class AdminPanel{
  @authorize
  deleteUser(userId:string){
      console.log(`User ${userId} is deleted`)
  }
}
const adminPanel = new AdminPanel();
adminPanel.deleteUser('002');
```

- ##### 方法缓存

缓存方法的返回结果，以提高性能。

```ts
function cache(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cacheMap = new Map<string, any>();
    descriptor.value = function (...args: any[]) {
        const key = JSON.stringify(args);
        if (cacheMap.has(key)) {
            return cacheMap.get(key);
        }
      	console.log(`计算${key}`)
        const result = originalMethod.apply(this, args);
        cacheMap.set(key, result);
        return result;
    };
    return descriptor;
}
class MathOperations {
    @cache
    factorial(n: number): number {
        if (n <= 1) {
            return 1;
        }
        return n * this.factorial(n - 1);
    }
}
const mathOps = new MathOperations();
console.log(mathOps.factorial(5)); // 120
console.log(mathOps.factorial(5)); // 从缓存中获取结果
```

- 让简写形式的类方法可枚举

```ts
function Enum(isEnum: boolean) {
  return function (target, propertyKey, descriptor) {
    console.log('target: ', target)
    console.log('propertyKey: ', propertyKey)
    console.log('descriptor: ', descriptor)
    descriptor.enumerable = isEnum
  }

}
class Animal {
  @Enum(true)
  eat() {
    console.log('anmial eat 方法')
  }
}

const animal = new Animal()
console.log(animal)
```

<img src="https://gitee.com/freeanyli/picture/raw/master/Pasted image 20240613105737.png" style="zoom:50%;" />



####  访问符装饰器

装饰类的访问器属性（getter 和 setter）。访问器装饰器可以用于修改或替换访问器的行为，添加元数据，进行日志记录等。

访问器装饰器是一个接受三个参数的函数：

1. **`target`**：装饰的目标对象，对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
2. **`propertyKey`**：访问器的名称。
3. **`descriptor`**：访问器的属性描述符。



- 日志记录

可以在访问器的 `get` 和 `set` 方法中添加日志记录，以跟踪属性的访问和修改

```js
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalGet = descriptor.get;
    const originalSet = descriptor.set;
    if (originalGet) {
        descriptor.get = function() {
            const result = originalGet.apply(this);
            console.log(`Getting value of ${propertyKey}: ${result}`);
            return result;
        };
    }
    if (originalSet) {
        descriptor.set = function(value: any) {
            console.log(`Setting value of ${propertyKey} to: ${value}`);
            originalSet.apply(this, [value]);
        };
    }
    return descriptor;
}
class User {
    private _name: string;
    constructor(name: string) {
        this._name = name;
    }
    @log
    get name() {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
    }
}
const user = new User("Alice");
console.log(user.name); // Getting value of name: Alice
user.name = "Bob"; // Setting value of name to: Bob
console.log(user.name); // Getting value of name: Bob
```

- ##### 权限控制

在访问器中添加权限检查，以控制属性的访问权限。

```ts
function adminOnly(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalGet = descriptor.get;
    descriptor.get = function() {
        const user = { role: 'user' }; // 示例用户对象
        if (user.role !== 'admin') {
            throw new Error("Access denied");
        }
        return originalGet.apply(this);
    };
    return descriptor;
}
class SecureData {
    private _secret: string = "top secret";
    @adminOnly
    get secret() {
        return this._secret;
    }
}
const data = new SecureData();
try {
    console.log(data.secret); // 抛出错误: Access denied
} catch (error) {
    console.log(error.message);
}
```

访问符装饰器在nestjs中用到的极少。

#### 属性装饰器

修饰类的属性。属性装饰器用于添加元数据或进行属性初始化等操作，但不同于方法装饰器和类装饰器，它不能直接修改属性的值或属性描述符。

属性装饰器是一个接受两个参数的函数：

1. **`target`**：装饰的目标对象，对于静态属性来说是类的构造函数，对于实例属性是类的原型对象。
2. **`propertyKey`**：装饰的属性名称。



- ##### 元数据添加

属性装饰器常用于添加元数据，可以结合 `Reflect` API 使用，以便在运行时获取元数据。

```ts
import "reflect-metadata";
function required(target: any, propertyKey: string) {
    Reflect.defineMetadata("required", true, target, propertyKey);
}
class User {
    @required
    username: string;
}
function validate(user: User) {
    for (let key in user) {
        if (Reflect.getMetadata("required", user, key) && !user[key]) {
            throw new Error(`Property ${key} is required`);
        }
    }
}
const user = new User();
user.username = "";
validate(user); // 抛出错误：Property username is required
```



- ##### 属性访问控制 

使用属性装饰器来定义属性的访问控制或初始值设置。

```ts
function defaultValue(value: string) {
  return function (target: any, propKey: string) {
    let val = value;
    const getter = function () {
      return val;
    };
    const setter = function (newVal: string) {
      val = newVal;
    };
    Object.defineProperty(target, propKey, {
      enumerable: true,
      configurable: true,
      get: getter,
      set: setter,
    });
  };
}

class Settings {
  @defaultValue("dark")
  theme!: string;
}

const s1 = new Settings();
console.log(s1.theme, "--theme");//dark --theme
```

- 对属性进行修改









1. 属性装饰器不能直接修改属性值或描述符，只能用于添加元数据或做一些初始化操作。
2. 属性装饰器通常与其他类型的装饰器（如方法装饰器、类装饰器）配合使用，以实现更复杂的功能。

#### 参数装饰器

修饰类构造函数或方法的参数。参数装饰器主要用于为参数添加元数据，以便在运行时能够获取这些元数据并进行相应的处理。与其他装饰器不同，参数装饰器不直接修改参数的行为或值。

参数装饰器是一个接受三个参数的函数：

1. **`target`**：装饰的目标对象，对于静态成员来说是类的构造函数，对于实例成员是类的原型对象。
2. **`propertyKey`**：参数所属的方法的名称。
3. **`parameterIndex`**：参数在参数列表中的索引。



- ##### 参数验证 

使用参数装饰器在方法调用时验证参数的值。

```ts
// 引入 reflect-metadata 库，用于反射元数据操作
import "reflect-metadata";
// 参数装饰器函数，用于验证方法参数
function validate(target: any, propertyKey: string, parameterIndex: number) {
    // 获取现有的必需参数索引数组，如果不存在则初始化为空数组
    const existingRequiredParameters: number[] = Reflect.getOwnMetadata("requiredParameters", target, propertyKey) || [];
    // 将当前参数的索引添加到必需参数索引数组中
    existingRequiredParameters.push(parameterIndex);
    // 将更新后的必需参数索引数组存储到方法的元数据中
    Reflect.defineMetadata("requiredParameters", existingRequiredParameters, target, propertyKey);
}
// 方法装饰器函数，用于在方法调用时验证必需参数
function validateParameters(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // 保存原始方法
    const method = descriptor.value;
    // 修改方法，使其在调用时验证必需参数
    descriptor.value = function (...args: any[]) {
        // 获取方法的必需参数索引数组
        const requiredParameters: number[] = Reflect.getOwnMetadata("requiredParameters", target, propertyKey) || [];
        // 遍历必需参数索引数组，检查相应的参数是否为 undefined
        for (let parameterIndex of requiredParameters) {
            if (args[parameterIndex] === undefined) {
                // 如果必需参数为 undefined，则抛出错误
                throw new Error(`Missing required argument at position ${parameterIndex}`);
            }
        }
        // 调用原始方法并返回其结果
        return method.apply(this, args);
    };
}
// 定义 User 类
class User {
    // 构造函数，初始化 name 属性
    constructor(private name: string) {}
    // 使用 validateParameters 方法装饰器装饰 setName 方法
    @validateParameters
    setName(@validate newName: string) {
        // 设置新的 name 属性值
        this.name = newName;
    }
}
// 创建一个 User 实例
const user = new User("Alice");
// 调用 setName 方法，传入有效参数
user.setName("Bob"); // 正常
// 调用 setName 方法，传入 undefined 作为参数，触发参数验证错误
user.setName(undefined); // 抛出错误: Missing required argument at position 0
// 导出一个空对象，以避免模块级别作用域污染
export {}
```

1. 参数装饰器只能应用于方法的参数，不能应用于类或属性。
2.  参数装饰器通常依赖 `Reflect` API 来存储和访问元数据，因此需要引入 `reflect-metadata` 库，并在 `tsconfig.json` 中启用 `emitDecoratorMetadata` 选项。



### 装饰器的执行顺序

**执行顺序**

1. **属性装饰器（Property Decorators）**和**方法装饰器（Method Decorators）**以及**访问器装饰器（Accessor Decorators）**
   - 按照它们在类中出现的顺序，从上到下依次执行。
2. **参数装饰器（Parameter Decorators）**
   - 在执行方法装饰器之前执行，按照参数的位置从右到左依次执行。
   - 对于同一个参数的多个装饰器，也是从从右向左依次执行
3. **类装饰器（Class Decorators）**
   - 最后执行。

```ts

//不同类型的装饰器的执行顺序
/**
 * 1.属性装饰器、方法装饰器、访问器装饰器它们是按照在类中出现的顺序，从上往下依次执行
 * 2.类装饰器最后执行
 * 3.参数装饰器先于方法执行
 */
function classDecorator1(target){
  console.log('classDecorator1')
}
function classDecorator2(target){
  console.log('classDecorator2')
}
function propertyDecorator1(target,propertyKey){
  console.log('propertyDecorator1')
}
function propertyDecorator2(target,propertyKey){
  console.log('propertyDecorator2')
}
function methodDecorator1(target,propertyKey){
  console.log('methodDecorator1')
}
function methodDecorator2(target,propertyKey){
  console.log('methodDecorator2')
}
function accessorDecorator1(target,propertyKey){
  console.log('accessorDecorator1')
}
function accessorDecorator2(target,propertyKey){
  console.log('accessorDecorator2')
}
function parametorDecorator4(target,propertyKey,parametorIndex:number){
  console.log('parametorDecorator4',propertyKey)//propertyKey方法名
}
function parametorDecorator3(target,propertyKey,parametorIndex:number){
  console.log('parametorDecorator3',propertyKey)//propertyKey方法名
}
function parametorDecorator2(target,propertyKey,parametorIndex:number){
  console.log('parametorDecorator2',propertyKey)//propertyKey方法名
}
function parametorDecorator1(target,propertyKey,parametorIndex:number){
  console.log('parametorDecorator1',propertyKey)//propertyKey方法名
}
@classDecorator1
@classDecorator2
class Example{
 
  @accessorDecorator1
  @accessorDecorator2
  get myProp(){
      return this.prop;
  }
  @propertyDecorator1
  @propertyDecorator2
  prop!:string
  @methodDecorator1
  @methodDecorator2
  method(@parametorDecorator4 @parametorDecorator3 param1:any,@parametorDecorator2 @parametorDecorator1 param2:any){}
}
//如果一个方法有多个参数，参数装饰器会从右向左执行
//一个参数也可有会有多个参数装饰 器，这些装饰 器也是从右向左执行的
```



# 《深入理解 Reflect-Metadata》

在学习nestjs的过程中，Reflect-Metadata很重要，因为nestjs主要是用装饰器来实现各种功能，装饰器可以通过声明的方法，在定义类的时候，扩充类成员和类成员的能力。

​	Reflect-Metadata与装饰器配合使用能够很方便的实现**在框架开发中的如路由/控制器的注册和管理**，**通过元数据来判断对某个方法或属性的访问权限**，**对属性添加校验**的功能。那么为什么要用元数据去做这些工作呢？

1. 首先元数据可以在不用修改原始代码(这点很重要，不会污染源代码)的情况下，动态的决定某些动作，如通过元数据对方法进行权限控制。
2. 其次Reflect-matadata可以很方便的在运行时操作，如标记类的构造函数参数或属性，运行时会自动解析并注入依赖。
3. API统一，由reflect-metadata统一提供。
4. 与装饰器配合使用更加强大， 1 + 1 > 2。

Reflect-Metadata作为ECMA的提案，并且Typescript早已支持了Reflect-Metadata相关的功能。再看例子之前，先要明白一个概念，什么是元数据？ 元数据其实就是**描述数据的数据**。

提案介绍: https://rbuckton.github.io/reflect-metadata/#introduction

github: https://github.com/rbuckton/reflect-metadata



## 定义元数据

定义元数据的方式有两种

1. 装饰器
2. 使用API定义的方法

api: 

```js
function defineMetadata(metadataKey: any, metadataValue: any, target: Object): void;
function defineMetadata(metadataKey: any, metadataValue: any, target: Object, propertyKey: string | symbol): void;
```

代码：

```ts
import 'reflect-metadata'

class AppController {
  
  // 1. 使用装饰器的方式
  @Reflect.metadata('money', {moneny: 10000})
  private userName: string
  constructor(userName: string) {
    this.userName = userName
  }
}

const appController = new AppController('zhangsan');

// 2. 使用api
// 给userName定义元数据
Reflect.defineMetadata('xingge','kailang',appController,'userName');

export default AppController
```


## 查看元数据

查看元数据是否存在

api: 

```js
function hasMetadata(metadataKey: any, target: Object, propertyKey: string | symbol): boolean;
```

代码：

```ts
// 查看userName是否存在元数据
const hasUserNameMetadata1 = Reflect.hasMetadata('xingge',appController,'userName')
const hasUserNameMetadata2 = Reflect.hasMetadata('money',appController,'userName')
console.log(hasUserNameMetadata1); // true
console.log(hasUserNameMetadata2); // true
```



## 获取元数据

api:

```js
function getMetadata(metadataKey: any, target: Object): any;
function getMetadata(metadataKey: any, target: Object, propertyKey: string | symbol): any;
```

代码：

```ts
// 获取userName元数据
const userNameMetaValue1 = Reflect.getMetadata('xingge',appController,'userName')
const userNameMetaValue2 = Reflect.getMetadata('money',appController,'userName')
console.log("userNameMetaValue1: ", userNameMetaValue1); // kailang
console.log("userNameMetaValue2: ", userNameMetaValue2); // { moneny: 10000 }
```



## 删除元数据

api:

```js
function deleteMetadata(metadataKey: any, target: Object): boolean;
function deleteMetadata(metadataKey: any, target: Object, propertyKey: string | symbol): boolean;
```

代码：

```ts
const isDeleteSuccess1 = Reflect.deleteMetadata('xingge',appController,'userName')
const isDeleteSuccess2 = Reflect.deleteMetadata('aaaaa',appController,'userName')
console.log(isDeleteSuccess1); // true
console.log(isDeleteSuccess2); // false
```



## 获取对象上所有的元数据键

api: 

```js
function getMetadataKeys(target: Object): any[];
function getMetadataKeys(target: Object, propertyKey: string | symbol): any[];
```

代码：

```js
const keys = Reflect.getMetadataKeys(appController, 'userName')
console.log(keys); // [ 'xingge', 'money' ]
```



还有两个api `hasOwnMetadata`和 `getOwnMetadata`。

这两个方法在nest中不常用，nestjs源码中也没有用到。

`Reflect.getOwnMetadata()` 方法只在对象本身上查找元数据。它不会沿着原型链向上搜索。

`Reflect.getMetadata()` 方法会首先在目标对象上查找元数据，如果没有找到，则会继续沿着原型链向上搜索，直到找到为止。如果在原型链上找到了元数据，就会返回该元数据。如果没找到则返回undefined。

定义一个`UserController`类继承`AppController`

```ts
class UserController extends AppController {
  constructor(userName: string) {
    super(userName)
  }
}
```

给`getHello`定义元数据

```ts
class AppController {
  @Reflect.metadata('money', {moneny: 10000})
  private userName: string
  constructor(userName: string) {
    this.userName = userName
  }

  // 给getHello定义元数据
  @Reflect.metadata('helloKey','helloValue')
  getHello(): string { 
    return 'Hello World!'
  }
}
```



分别从`appController`和`userController`获取`getHello`的元数据

```ts
console.log(Reflect.getMetadata('helloKey', appController, 'getHello'));  // helloValue
console.log(Reflect.getOwnMetadata('helloKey', appController, 'getHello')); // undefined

const userController = new UserController('lisi');  
console.log(Reflect.getMetadata('helloKey', userController, 'getHello')); // helloValue
```

因为`helloKey`是定义在父级的，`getOwnMetadata`获取不到，而`appController`和`userController`的 `getMetadata`方法都可以获取到，因为它可以沿着原型链查找。

如果非要通过`getOwnMetadata`获取数据呢，那就从原型上获取

```ts

console.log(Reflect.getMetadata('helloKey', appController, 'getHello'));  // helloValue
// 获取到 AppController 的 prototype
console.log(Reflect.getOwnMetadata('helloKey', Reflect.getPrototypeOf(appController)!, 'getHello')); // helloValue

const userController = new UserController('lisi');  
console.log(Reflect.getMetadata('helloKey', userController, 'getHello')); // helloValue
// @ts-ignore
// 获取到UserController的原型的原型
console.log(Reflect.getOwnMetadata('helloKey', UserController.__proto__.prototype, 'getHello')); // helloValue

```

`hasOwnMetadata`方法同理。

其实Reflec-metadata还有一个API，`metadata`

```ts
function metadata(metadataKey: any, metadataValue: any)
```

其实这个api我们已经用过了，是在类中使用的。

<img src="https://gitee.com/freeanyli/picture/raw/master/image-20240706233832775.png" alt="image-20240706233832775" style="zoom:50%;" />

## emitDecoratorMetadata

这个tsconfig配置项与Reflect-matadata息息相关，用来决定是否启用 编译结果是否输出元数据类型用来做反射。

ts代码

```ts
import "reflect-metadata";

function LogMethod(
  target: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) {
  console.log(target);
  console.log(propertyKey);
  console.log(descriptor);
}
 
class Demo {
  @LogMethod
  public foo(bar: number) {
    // do nothing
  }
}
 
const demo = new Demo();
```

开启emitDecoratorMetadata编译后的结果

```ts
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
function LogMethod(target, propertyKey, descriptor) {
    console.log(target);
    console.log(propertyKey);
    console.log(descriptor);
}
class Demo {
    foo(bar) {
        // do nothing
    }
}
__decorate([
    LogMethod,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], Demo.prototype, "foo", null);
const demo = new Demo();
```

多出来的这几行代码(ts把这三个键和对应的类型信息添加到数据上)

```ts
__metadata("design:type", Function),
__metadata("design:paramtypes", [Number]),
__metadata("design:returntype", void 0)
```

- design:type 表示被装饰的对象是什么类型

- design:paramtypes 表示被装饰对象的参数类型, 是一个表示类型的数组, 如果不是函数, 则没有该 key

- design:returntype 表示被装饰对象的返回值属性



## 实现依赖注入

我们了解了`design:xxx`的意思后，结合`reflect-metadata`和装饰器，就可以实现依赖注入了

```ts
import "reflect-metadata";

function Injectable() {
  return function (target: any) {
    Reflect.defineMetadata("injectable", true, target);
  };
}

class MyDependency {
  doSomething() {
    console.log("MyDependency doSomething执行");
  }
}

class MyDependency1 {
  dep2Method() {
    console.log("MyDependency1 dep2Method 执行");
  }
}


@Injectable()
class MyService {
  constructor(private _dependency: MyDependency, private _dependency1: MyDependency1) {}

  doSomething() {
    this._dependency.doSomething();
    this._dependency1.dep2Method();
  }
}


class DependencyInjection {
  static get<T>(target: any): T {
    const isInjectable = Reflect.getMetadata("injectable", target);
    
    if (!isInjectable) {
      throw new Error("Target is not injectable");
    }

    const dependencies = Reflect.getMetadata("design:paramtypes", target) || []; // [ [class MyDependency], [class MyDependency1] ]
    
   const instances = dependencies.map(provider => new provider());

    return new target(...instances);
  }
}

const myService = DependencyInjection.get<MyService>(MyService);
/**
MyDependency doSomething执行
MyDependency1 dep2Method 执行
 */
myService.doSomething(); 
```

上面使用`@Injectable`装饰器进行依赖注入，不手动实例化对象，也可以使用`this._dependency`获取到实例对象。



