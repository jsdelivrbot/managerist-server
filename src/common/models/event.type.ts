import {Department} from './department'
export class EventType {
    public _id: any;
    public name: string = '';
    public description: string = '';

    action:boolean = false;
    alert:string|null = '';
    // Refs
    public department: Department = new Department;
}
