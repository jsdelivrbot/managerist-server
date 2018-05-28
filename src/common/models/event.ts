import {Company} from "./company";
import {Product} from "./product";
import {Project} from "./project";
import {Employee} from "./employee";
import {EventType} from "./event.type";


export class Event {
    public _id: any;
    public date: number = 0;  // timestamp
    public description: string = '';
    public processed: boolean = false;
    public viewed: number = 0;

    // custom formatted for each eventtype
    public details:any = {};
    // Refs
    public company: Company = new Company;
    public type: EventType = new EventType;

    // Chain
    public parent: Event;
    public children: Event[];
}