import {Company} from "./company";
import {ActionType} from "./action.type";


export class Action {
    public _id: any;
    public date: number = 0;  // timestamp

    // custom formatted for each eventtype
    public details:any = {};
    // Refs
    public company: Company = new Company;
    public type: ActionType = new ActionType;
}