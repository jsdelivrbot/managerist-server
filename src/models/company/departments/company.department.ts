import {CompanyDepartment as CommonCompanyDepartment} from "../../../common/models/company.department";
import {Department} from "../../department";
export {CompanyDepartment as CommonCompanyDepartment} from "../../../common/models/company.department";

export interface CompanyDepartmentInterface {
    new(_d?:Department):CompanyDepartment;
}

export abstract class CompanyDepartment extends CommonCompanyDepartment {
    constructor(d?:Department, data?:any) {
        super();
        this.department = d;
        if (data)
            for (let d of Object.getOwnPropertyNames(data))
                (<any>this)[d] = data[d];
    }

    get common() {
        return {
            department: this.department._id || this.department,
            head: (this.head && this.head._id) || this.head
        };
    }
}