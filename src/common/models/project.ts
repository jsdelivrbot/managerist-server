import {Company} from "./company";
import {Product} from "./product";
import {FeatureImplementation} from "./feature";
import {Technology} from "./technology";
import {Audience} from "./audience";
import {Department} from "./department";

export enum ProjectType {
    // Product - types
    Startup, Upgrade, Outsource,
    // Marketing
    Campaign,
    // Other
    Special
};
export enum ProjectStatus {New, Active, Paused, Cancelled, Resolved, Closed};

/**
 * Deployment cavern
 */
export class Bomb {
    created: number; // development time-mark when was "put"
    chances: number; // 0-1 ~ chances to hit during deployment
    severity: number; // 0-1 ~ possible impact & hardness (on lost time) when hit
}
/**
 *  p0x0 Class Project
 *
 * representation of workload, to achieve something:
 * most common ~ Product Sprint with features upgrades or creating implementation
 * Product marketing campaign also may be treates as a project
 * so as Finance system implementation, witch reduce workload by 80%
 *
 */
export class Project {
    public _id: any;
    public company: Company = new Company;

    public department: any = new Department;
    public audience: Audience = new Audience; // for marketing-type projects

    public product: Product = new Product;
    public features: FeatureImplementation[] = [];
    public type: ProjectType = ProjectType.Startup;
    public status: ProjectStatus = ProjectStatus.New;

    public todo: number = 0;
    public quality:number = 0;
    public bombs: Bomb[] = [];
    public completed: number = 0;
    public testingTodo: number = 0;
    public testingCompleted: number = 0;
    public deployTodo: number = 0;
    public deployCompleted: number = 0;

    public startDate: number = 0;  // timestamp
    public lastActivityDate: number = 0;  // timestamp
    public endDate: number = 0;  // timestamp

    public reward: ProjectResults = <ProjectResults>{};

    /**

    public name: string = '';

    public area: Area = Area.Client;
    public description: string = '';
    public skills: [Skill] = [] as [Skill];
    */
}

/**
 * Class ProjectOptions
 *
 */
export class ProjectOptions {

}

/**
 * Class ProjectReward
 *
 * Representation of the project-end results,
 * as most common ~ Product-cycle iteration (sprint/startup/upgrade) - resulting with featureImplementations on product updates so as product net worth
 *
 * Also it represent costs
 * for example marketing campaign costs money, so company.funds will be negative
 *
 */
export class ProjectResults {
    company?: {
        funds?: number,
        net?:number
    };
    product?: {
        net?: number,
        monthly?: number,
        bugRate?: number,
        tdRate?: number
    };
    audience?: {
        growth?: number,
        monthly?: number,
        size?: number,
        conversion?: number,
        converted?: number,
        satisfaction?: number
    };
    features?: {
        _id: any,
        complexity?: number,
        quality?: number,
        volume?: number,
        value?: number,
        technologies?: Technology[]
    }[];
}
