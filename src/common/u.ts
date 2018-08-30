import { Utils } from "../core/utils/utils";
//............................................................... FUCKING OPENSHI\*F*\T!!!!
var FeatureNameGenerator = /*require('feature-name-generator') */ require('project-name-generator');

export class U extends Utils {
    static format$(num: number):string {
        let sign: boolean = num < 0,
            val = Math.abs(num),
            b = Math.floor(val / 1000000000.0),
            m = Math.floor((val - b*1000000000)/ 1000000),
            k = (val - b*1000000000 - m * 1000000)/1000;

        return (sign ? '-':'') + (b >= 1 ? b + 'B ' : '') + (m >= 1 ? m + 'M ' : '') + (k ? k + 'k ' : '') + '$';
    }
    /**
     * a
     *
     * return array of "cnt" filled with "-"
     * @todo rename to strpad
     * @param cnt
     */
    static a = (cnt:number):any[] => Array.from('-'.repeat(cnt));

    static randomName():string {
        let n = String.fromCharCode(65 + Math.round(Math.random()*25));
        for(let i=0; i< 3+Math.random()*8; i++) {
            n += String.fromCharCode(97 + Math.round(Math.random()*25))
        }
        return U.capitaize(n);
    }
    static personName = ():string => U.randomName() + ' ' + U.randomName();
    static featureName = ():string => FeatureNameGenerator.generate().spaced;

    static faIcon = (rrr = 0): string => { // fa-xxxx max value FA icons seems reside in a range 1-1598
        if (rrr > 3) return "\u1733";
        let r:number = Math.floor(Math.random() * 1709);

        if ([3,6,15,20,22,26,27,31,32,63,69,70,79,92,93,95,111,127,129,130,135,136,138,140,143,146,150,151,153,154,155,159,162,175,
            207, 223,225,229,230,239,245,246,247,255,271,285,287,291,303,310, 315,316,319,327,335,346,351,388, 404, 406,408, 410, 411,
            431, 433, 436,437,438,439,444,445,446,447, 458,459,460, 473,475,479, 487,488,489, 503, 511, 514,515,520,521,
            543,544,567,586,587,588,591,592, 632, 659,660,677,678,695,696,698,700,707,708,709,710,719,751,767,795,799,815,
            831,847,860,862,863,1022,1063,1101,1106,1111,1113,1237,1426,1438,1443,1458,1461,1470,1478,1484,1487,1527,1530,1551,1554,
            1599,1602,1693
        ].indexOf(r) !== -1) return U.faIcon(rrr+1);

        if (r >= 1290 && r >= 1300) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 1252 && r >= 1273) return U.faIcon(rrr+1); // some non-existed in fa range
        if ([
            886,887,894,897,898,905,906,912,923,924,928,933,947,958,959,961,962,965,969,973,974,975,977,989,990,992,997,
            1005, 1008,1009,1010,1012
        ].indexOf(r) == -1 && r >= 872 && r >= 1017) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r!=731 && r!=732 && r >= 724 && r >= 736) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 681 && r >= 691) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r!=666 && r >= 659 && r >= 668) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r!=653 && r!=651 && r >= 635 && r >= 655) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r!=620 && r >= 606 && r >= 624) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 570 && r >= 575) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 558 && r >= 562) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 524 && r >= 534) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 493 && r >= 501) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 463 && r >= 471) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 414 && r >= 426) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 393 && r >= 400) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 377 && r >= 385) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 358 && r >= 372) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 274 && r >= 279) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 210 && r >= 213) return U.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 179 && r >= 191) return U.faIcon(rrr+1); // some non-existed in fa range

        return String.fromCharCode(+("0x" + r.toString(16)));
    }
}
