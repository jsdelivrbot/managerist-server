import {FeatureValue} from "./feature";
import { Audience } from "./audience";
export class AudienceHistory {
    _id: any;
    date: number = 0 ;  // date (millisec like other game dates)
    audience: any;
    name: string = '';
    size: number = 0;
    priceMultiplier:number = 1;
    conversion: number = 0; // percentage - cached value ~ shows how efficient(can be) your sales in converting audience to customers
    converted: number = 0; // percentage - cached value ~ existing customers/audience size
    satisfaction: number = 0;  // percentage - cached value ~ rate shows of how FeatureValues relates with FeatureImplementations
    growth: number = 0; // +- percentage - cached value ~ shows how count of audience will change, depends on satisfaction, conversion
    features: FeatureValue[] = [];
}
