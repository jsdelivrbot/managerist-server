import {BasicProperty} from "./character";
import {TechnologyExpertise} from "./technology";
import {Department} from "./department";

export class Role {
    name: string = '';
    department: Department = new Department;
    trait: {n:number, character: {basics:BasicProperty, value:number}[]}|any = {};
    expertise: TechnologyExpertise[] = [];
}