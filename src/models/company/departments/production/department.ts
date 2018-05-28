import {CompanyDepartment} from "../company.department";
import {Department} from "../../../department";

export class ProductionCompanyDepartment extends CompanyDepartment {
    constructor(data?:any) {
        super(<Department>(Department.getByName('Production')), data);
    }

    get common() {
        return {
            department: this.department._id
        };
    }
}