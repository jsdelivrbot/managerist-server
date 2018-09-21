import {Company} from "./company";
export class Credit {
    creditor: string = '';
    amount: number = 0;
    nextPayment: number = 0;
    percent: number = 0;
    created: number = 0; // timestamp
    deadline: number = 0; // timestamp
    // Refs
    company: Company = new Company; // issued to
}
