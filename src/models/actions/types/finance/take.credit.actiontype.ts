import { BaseActionType } from "../../base.actiontype";
import { Action } from "../../action";
import { Company } from "../../../company";
import { Credit } from "../../../credit";

/***
 *
 */
export class TakeCreditActionType extends BaseActionType {
    protected _credit: Credit;

    get actionDetails():any  {
        return {
            date: this._date || this.ga.time,
            company: this._company._id,
            description: 'Credit ' + this._credit.amount + ' was taken from "' + this._credit.creditor + '".',
            details: {
                credit: this._credit._id,
            }
        }
    }

    /**
     *
     * @param data
     * @returns {any}
     */
    do(data:any): Promise<Action> {
        if (!data.company)
            throw new Error('Can\'t perform "TakeCredit" Action: Company is not set.');
        this._date = new Date(data.date || this._date);
        this._company = data.company;

        let prc = Credit.ordinalPercent + Math.random(),
            amount = Credit.minAmount + Math.random() * 10 * Credit.minAmount,
            pamount = amount + amount*prc,
            getCompany = (this._company._id
                ? Promise.resolve(this._company)
                : (new Company(this._ga)).findById(this._company._id || this._company)
                .then((c:Company) => this._company = c)
        );

        return getCompany
                .then(() => 
                    (new Credit(this._ga))
                    .populate({
                        creditor: Credit.randomBank,
                        amount: pamount,
                        nextPayment: pamount/12,
                        percent: prc,
                        company: this._company._id || this._company,
                        created: this._date,
                        deadline: this._date.setFullYear(this._date.getFullYear() + 1)
                    })
                    .save()
                )
                .then((c:Credit) => {
                    this._credit = c;
                    this._company.populate({
                        funds: this._company.funds + amount
                    })
                    .save()
                })
                .then(() => super.do.call(this,{}));
    }
}