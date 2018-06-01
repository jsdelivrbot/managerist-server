export class MonthEndEventType{/* extends BaseEventType implements CustomerEventType {
    protected _type:EventType = EventType.MonthEnd;
    protected _period:number = 2628000; // 1month
    protected _probability:number = 1; // 100%

    protected _fundsChange:number;
    get eventData():any  {
        return {
            type: EventType[EventType.MonthEnd],
            description: 'Month ended. Salaries Payed, Income received. ' + U.format$(this._fundsChange),
            details: {
                funds: this._fundsChange
            }
        }
    }

    /**
     *
     * @param e
     * @returns {Promise<Event[]>}
     * /
    process(e:Event|any) : Promise<Event[]> {
        let events: Event[] = [],
            arC:Company|any = (new Company(this.ga));

        return arC.findById(e.company) // to populate data into ActiveRecord
            .then(() => arC.getFinancials(e.company))
            .then((finData:any) => {
                this._fundsChange = (finData.monthly || 0) - (finData.salaries || 0);
// TODO logic
                
                return arC.update({
                    _id: e.company,
                    funds: (arC.funds || 0) - (finData.salaries || 0) + (finData.monthly || 0)
                });
            })
            .then(() => e
                .populate(this.eventData)
                .populate({processed: true})
                .save()
            )
            .then(() => events)
    }
    */
}