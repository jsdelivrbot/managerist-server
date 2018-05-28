import {Company} from "./company";
import {Position} from "./position";
import {Product} from "./product";
import {Project} from "./project";
import {TechnologyExpertise} from "./technology";
import {Role} from "./role"
import {Character} from "./character"

export enum Gender {Male, Female};

export class Employee {
    _id: any;
    name: string = '';
    pic: string = 'm_1';
    gender:Gender = Gender.Male;
    character: Character;
    expertise:TechnologyExpertise[] = [];
    efficiency: number = 0;
    salary: number = 0;

    description: string = '';

    // Refs
    role:Role = new Role;
    company: Company = new Company;
    product: Product = new Product;
    project: Project = new Project;

    visible: Company[] = [];
}