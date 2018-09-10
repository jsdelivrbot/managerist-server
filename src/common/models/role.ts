import {BasicProperty} from "./character";
import {TechnologyExpertise, ExpertiseLevel} from "./technology";
import {Department} from "./department";

export class Role {
    name: string = '';
    department: Department = new Department;
    minLevel: ExpertiseLevel = ExpertiseLevel.Middle;
    trait: {n:number, character: {basics:BasicProperty, value:number}[]}|any = {};
    expertise: TechnologyExpertise[] = [];
}