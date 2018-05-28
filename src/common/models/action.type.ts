import {Department} from './department'
export class ActionType {
    public _id: any;
    public name: string = '';
    public description: string = '';

    // Refs
    public department: Department = new Department;
}
