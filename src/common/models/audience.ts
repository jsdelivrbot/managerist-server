import {FeatureValue} from "./feature";
import {Product} from "./product";
export class Audience {
    _id: any;
    name: string = '';
    size: number = 0;
    conversion: number = 0; // percentage - cached value ~ shows how efficient(can be) your sales in converting audience to customers
    converted: number = 0; // percentage - cached value ~ existing customers/audience size
    satisfaction: number = 0;  // percentage - cached value ~ rate shows of how FeatureValues relates with FeatureImplementations
    growth: number = 0; // +- percentage - cached value ~ shows how count of audience will change, depends on satisfaction, conversion
    features: FeatureValue[] = [];

    // Refs

    // MVP ~ Claim that each product have it's own audience
    product: Product = new Product();
}
