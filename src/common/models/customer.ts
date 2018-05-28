import {Audience} from "./audience";
import {BusinessModel} from "./business.model";

export class Customer {
    _id: any;
    count:number = 0;

    // MVP ~ applied depending on Sales skills, no UI to setup
    businessModels:BusinessModel[] = [];

    // Refs
    audience: Audience = new Audience();
    // productId: any; // derived from audience,.. maybe cache ??
}