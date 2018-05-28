import {Product} from "./product";
export enum BusinessModelType{Standard, Support, Hybrid, Subscription, Micropayments, Ads};

export class BusinessModel {
    businessModel:BusinessModelType = BusinessModelType.Standard;
    price: number = 0;

    hitperiod:number = 0; // period when "throws" action (in seconds); zero for standard
    hitrate:number = 0;   // income probability; 1 for non probabilistic (Standard, Subscription)

    // Refs
    product: Product = new Product();
}