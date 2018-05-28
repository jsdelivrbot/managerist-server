/**
 * TBD
 *
 * Restore project state from the backup (events log dump)
 *
 */
import {Game, GameActivity} from "../game";
import {Event} from "../event";
import {MongoTypes, SchemaTypes, ActiveRecord, ActiveRecordRule, ActiveRecordRulesTypes} from "../../core/db/active.record";

export class RestoreProject {
    /**
     *  TODO: Do...
     *
     *  currently copapasted from old Project
     *
     * @param id
     * @param withEmp
     * @returns {any}
     * /
    workHistory(id?:any, withEmp:boolean = true): Promise<any> {
        id = id || (<any>this)._id;
        if (!id)
            return Promise.reject('No Project ID.');

        let aggregation:any[] = [
            {$match:{$or:[
                {type:{$in:["Assignment", "Resignment"]}, "details.project": MongoTypes.ObjectId(id)},
                {type:"Dismissal"}
            ]}},
            {$sort: {"details.employee":1, date:1}},
            {$group: {_id: "$details.employee",
                "starts": {$push: {$cond:{ if:{$eq:["$type", "Assignment"]},
                    then: {
                        date: "$date",
                        efficiency: "$details.efficiency",
                        project: "$details.project",
                        product: "$details.project",
                    },
                    else:false}
                }},
                "ends": {$push: {$cond:{ if:{$ne:["$type", "Assignment"]},
                    then: {
                        date: "$date",
                        project: "$details.project",
                        product: "$details.project",
                    },
                    else:false
                }}}
            }},
            withEmp ? {$lookup: {from: "employees", localField: "_id", foreignField: "_id", as: "emp"}} : false,
            withEmp ? {$unwind: "$emp"} : false,
            {$project: {
                employee: withEmp ? "$emp" : "$_id",
                starts: {$filter:{input: "$starts", as:"e", cond:{$ne:["$$e",false]}}},
                ends: {$filter:{input: "$ends", as:"e", cond:{$ne:["$$e",false]}}},
            }},

        ].filter((a:any) => !!a);
//console.log("WorkHistory", {type:{$in:["Assignment", "Resignment"]}, "details.project": SchemaTypes.ObjectId(id)}, JSON.stringify(aggregation));
        return new Promise((resolve, reject) => {
            (new Event(new GameActivity(null, null))).model.aggregate(aggregation)
                .exec((err: Error, data: any) => {
                    err ? reject(err) : resolve(data);
                });
        });
    }


    /**
     * TODO: Do...
     *
     *   currently copapasted from old Project
     *
     *   '''
     *
     * Calculate project progress
     *
     * @param startDate
     * @param endDate
     * @returns {any|Promise<{project: Project, hours: number, completedAt: number|boolean}>}
     * /
    burnout(startDate?:number, endDate?: number): Promise<any>
    {
        if (!endDate) {
            endDate = startDate;
            let gst = (new Game).startDate.getTime();
            startDate = (<any>this).lastActivityDate || (<any>this).startDate || gst;

            /**
             * Maybe saved before Server started
             * TODO: Think about logic on not-continuous server || continuously restored from basic game-DB
             * HACK~FIXME
             * /
            if (gst > startDate)
                startDate = gst;
        }
        endDate = endDate || (new Game).simulationDate.getTime();

        console.log('Burnout ' + (<any>this).name + ' from |' + (new Date(startDate)) + '| to |' + (new Date(endDate)));
        return this.workHistory()
            .then((emps:any[]) => {
                console.log(emps);
                return emps;
            })
            .then((emps:any[]) =>
                emps.map((empHist:any) => {
                    let t = 0;

                    empHist.ends.push({date:endDate});
                    for(let i =0; i< empHist.starts.length && empHist.ends[0]; i++) {
                        while(empHist.ends.length && empHist.ends[0].date < empHist.starts[i].date) {
                            empHist.ends = empHist.ends.slice(1);
                        }
                        // No corresponding end
                        if (!empHist.ends.length) continue;

                        // Not started yet
                        // console.log('\t ' + (new Date(empHist.starts[i].date)) + '| <-' + empHist.employee.name + ' skipped |' + (new Date(startDate)) + '\n');
                        if (empHist.starts[i].date > startDate) continue;

                        // Already resigned
                        // console.log('\t ' +i + '(' + empHist.starts.length +  ')' + (new Date(empHist.starts[i].date)) + '| <-' + empHist.employee.name + ' resigned |' + (new Date(empHist.ends[0].date))) + '\n';
                        if (empHist.ends[0].date < startDate) continue;

                        let e = empHist.ends[0].date < endDate ? empHist.ends[0].date : endDate,
                            dt = (e - startDate) * (empHist.starts[i].efficiency / 100);
                        t += dt;
                        //console.log("\t~~worklog from |" + (new Date(startDate)) + '| to |' + (new Date(e)) + empHist.employee.name + ' worked:' + dt + '\n');
                    }
                    //console.log("\t\t" + empHist.employee.name + ' Total worked:' + t + '(' + (t/3600000)+  ')'+'\n');
                    return t / 3600000;
                })
            ).then((hours:number[]) => {
                let h = hours.reduce((a,b) => a+b, 0);
//console.log('\tTOTAL SUMM: ' + h);
                let completedAt = false;
                if ((<any>this).hours <= ((<any>this).hoursCompleted + h)) {
                    completedAt = ((<any>this).startDate || (new Game).startDate.getTime()) +
                        ((<any>this).hours - (<any>this).hoursCompleted) * 3600000;
                }

                return {
                    project: this,
                    hours: h,
                    startDate,
                    endDate,
                    completedAt
                };
            });
    }

     */
}