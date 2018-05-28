import {Technology} from "./technology";
export enum KeyDepartments {Finance, Marketing, Production, HR}

export class Department {
    name:string = '';
    branch: Technology = new Technology;
    //parent: Department; // TBD
    //condition: string;  // Filled Role after witch new department appear
    head: string[] = [];  // Role Name Chain: i.e. CFO --(if not)--> Chief Accountant -> Accountant, there for order matters
}