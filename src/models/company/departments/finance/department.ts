import {CompanyDepartment} from "../company.department";
import {Department} from "../../../department";

export class FinanceCompanyDepartment extends CompanyDepartment {
    constructor(data?:any) {
        super(<Department>(Department.getByName('Finance')), data);
    }

    get common() {
        return {
            department: this.department._id
        };
    }
}