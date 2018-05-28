import {User} from "./user";
import {Product} from "./product";
import {Employee} from "./employee";
import {CompanyDepartment} from "./company.department"

export enum CompanySize{Startup, Small, Medium, Big, Dinosaur};

export class Company {
    _id: any;
    name: string = '';
    projects: string[] = [];
    net: number = 0.0;
    funds: number = 0.0;
    size: CompanySize = CompanySize.Startup;
    departments: CompanyDepartment[] = [];

    // Refs
    public user: User = new User();
}
