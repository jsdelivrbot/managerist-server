import {CompanyDepartment} from "../company.department";
import {Department} from "../../../department";

export class MarketingCompanyDepartment extends CompanyDepartment {
    constructor(data?:any) {
        super(<Department>(Department.getByName('Marketing')), data);
    }

    get common() {
        return {
            department: this.department._id,
            head: this.head._id || this.head
        };
    }
}