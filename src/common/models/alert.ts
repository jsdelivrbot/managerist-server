import {Company} from "./company";
import {Department} from "./department";
import {AlertType} from "./alert.type";


export class Alert {
    public _id: any;
    public date: number = 0;  // timestamp
    public description: string = '';
    public details: any;
    public resolved: boolean = false;
    public ignored: boolean = false;

    // Refs
    public department: Department = new Department;
    public company: Company = new Company;
    public type: AlertType = new AlertType;
}