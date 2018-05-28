import {Company} from "./company";
import {Product} from "./product";
import {Employee} from "./employee";
import {Project} from "./project";
import {Role} from "./role"

export class Position {
    _id: any;
    startDate:number = 0;
    endDate:number = 0;

    efficiency:number = 0;
    // Refs
    parent: Position;
    employee: Employee = new Employee;
    company: Company = new Company;
    role: Role = new Role;
    product: Product = new Product;
    project: Product = new Product;
}