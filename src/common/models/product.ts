import {Company} from "./company";
import {FeatureImplementation} from "./feature";

// ??? Application?, not sure Applicatioin will be ready soon ...
export enum ProductArea {HW, OS, Tool, Framework, Client};

export enum ProductStage {
    Idea, Alpha, Beta, Active, Maintenance, Closed
    //Design, Develop, Alpha, Beta, Release, Deploy, Active
};


export class Product {
    _id: any;

    name: string = '';
    version: number = 0;
    monthly: number = 0;
    net: number = 0;
    area: ProductArea = ProductArea.Client;
    bugRate: number = 0;
    tdRate: number = 0;
    features: FeatureImplementation[] = [];
    stage: ProductStage = ProductStage.Idea;

    // Refs
    company: Company = new Company();
}
