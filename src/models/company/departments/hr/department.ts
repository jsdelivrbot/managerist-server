import {CompanyDepartment} from "../company.department";
import {Role} from "../../../role";
import {Department} from "../../../department";

export class HrCompanyDepartment extends CompanyDepartment {
    private static _DEFAULT_AGENCY_PRICE = 100;
    public priority:Role[];
    public agencyPrice:number;

    constructor(data?:any) {
        super(<Department>(Department.getByName('HR')), data);
    }

    get common() {
        return {
            department: this.department._id || this.department,
            head: this.head._id || this.head,
            priority: (this.priority || []).map((r:any) => r._id || r),
            agencyPrice: this.agencyPrice || HrCompanyDepartment._DEFAULT_AGENCY_PRICE
        };
    }

    public randomRole(): Promise<Role> {
        let searchParams:any = {};
        if (this.priority.length)
            searchParams = {
                _id: this.common.priority
            };
        return (new Role).findAll(searchParams)
            .then((roles:Role[]) => {
                if (!roles.length)
                    throw new Error('No roles matched to HR priority filter.');

                return <Role>roles[Math.floor(Math.random() * roles.length)];
            })
    }
}