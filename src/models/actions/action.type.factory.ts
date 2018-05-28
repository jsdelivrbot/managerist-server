import * as ActionTypeClasses from './types';

export class ActionTypeFactory {
    static create(name:string):any {
        return ((<any>ActionTypeClasses)[name + 'ActionType']);
    }
}