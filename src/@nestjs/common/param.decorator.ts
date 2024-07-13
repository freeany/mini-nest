import 'reflect-metadata';
export const createParamDecorator = (key: string) => {
    // target: Controller类的原型对象  
    // propertyKey：参数所属的方法的名称  
    // parameterIndex: 参数在参数列表中的索引
    return (data?:any) => (target: any, propertyKey: string, parameterIndex: number) => {   
        // 因为通过装饰器修饰的参数可能会有多个，一个个保存
        const existingParameters = Reflect.getMetadata(`params`,target,propertyKey)||[];
        existingParameters[parameterIndex] = { parameterIndex, key, data };
        
        // 将解析后的参数数组放到Controller类的方法上。从这个方法就能拿到数据。
        Reflect.defineMetadata(`params`, existingParameters, target, propertyKey);
    }
}
export const Request = createParamDecorator('Request');
export const Req = createParamDecorator('Req');
export const Response = createParamDecorator('Response');
export const Res = createParamDecorator('Res');
export const Session = createParamDecorator('Session');
export const Param = createParamDecorator('Param');
export const Body = createParamDecorator('Body');
export const Query = createParamDecorator('Query');
export const Headers = createParamDecorator('Headers');
export const Ip = createParamDecorator('Ip');
export const HostParam = createParamDecorator('HostParam');
export const Next = createParamDecorator('Next');
export const Aaa = createParamDecorator('Aaa');
export const Bbb = createParamDecorator('Bbb');
