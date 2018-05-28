import {Company} from "./company";
export class Credit {
    creditor: string = '';
    amount: number = 0;
    percent: number = 0;
    deadline: number = 0; // date (seconds) when should be returned

    // Refs
    company: Company = new Company; // issued to
}
