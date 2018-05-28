import {Department} from './department'
export enum AlertLevel {info, success, warning, error};
export class AlertType {
    _id: any;
    name: string = '';
    description: string = '';
    help: string = '';
    level:AlertLevel = AlertLevel.info;
    // Refs
    public department: Department = new Department;
}
