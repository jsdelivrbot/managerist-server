export class FA {
    static faIconPro = (rrr = 0): string => { // fa-xxxx max value FA icons (v5.3.1) seems reside in a range 0-1733
        if (rrr > 3) return String.fromCharCode(0xf000 + 1733);
        let r:number = Math.floor(Math.random() * 1709);

        if ([3,6,15,20,22,26,27,31,32,63,69,70,79,92,93,95,111,127,129,130,135,136,138,140,143,146,150,151,153,154,155,159,162,175,
            207, 223,225,229,230,239,245,246,247,255,271,285,287,291,303,310, 315,316,319,327,335,346,351,388, 404, 406,408, 410, 411,
            431, 433, 436,437,438,439,444,445,446,447, 458,459,460, 473,475,479, 487,488,489, 503, 511, 514,515,520,521,
            543,544,567,586,587,588,591,592, 632, 659,660,677,678,695,696,698,700,707,708,709,710,719,751,767,795,799,815,
            831,847,860,862,863,1022,1063,1101,1106,1111,1113,1237,1426,1438,1443,1458,1461,1470,1478,1484,1487,1527,1530,1551,1554,
            1599,1602,1693
        ].indexOf(r) !== -1) return FA.faIconPro(rrr+1);

        if (r >= 1290 && r <= 1300) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r >= 1252 && r <= 1273) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if ([
            886,887,894,897,898,905,906,912,923,924,928,933,947,958,959,961,962,965,969,973,974,975,977,989,990,992,997,
            1005, 1008,1009,1010,1012
        ].indexOf(r) == -1 && r >= 872 && r <= 1017) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r!=731 && r!=732 && r >= 724 && r <= 736) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r >= 681 && r <= 691) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r!=666 && r >= 659 && r <= 668) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r!=653 && r!=651 && r >= 635 && r <= 655) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r!=620 && r >= 606 && r <= 624) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r >= 570 && r <= 575) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r >= 558 && r <= 562) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r >= 524 && r <= 534) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r >= 493 && r <= 501) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r >= 463 && r <= 471) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r >= 414 && r <= 426) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r >= 393 && r <= 400) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r >= 377 && r <= 385) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r >= 358 && r <= 372) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r >= 274 && r <= 279) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r >= 210 && r <= 213) return FA.faIconPro(rrr+1); // some non-existed in fa range
        if (r >= 179 && r <= 191) return FA.faIconPro(rrr+1); // some non-existed in fa range

        return String.fromCharCode(0xf000 + r);
    }

    static faIcon = (rrr = 0): string => { // fa-xxxx max value FA icons (v5.3.1 (Free) (without branding)) seems reside in a range 0-1709
        if (rrr > 3) return String.fromCharCode(0xf000 + 1709);
        let r:number = Math.floor(Math.random() * 1703);

        if ([63,69,70,71,79,92,93,95,127,129,130,135,136,138,140,143,146,150,151,153,154,155,159,162,175,
            207, 223,225,229,230,239,245,246,247,255,271,285,287,291,303,310, 315,316,319,325, 327,328,329, 332,335,
            346,351,388, 404, 406,408, 410, 411, 431, 433, 436,437,438,439, 444,445,446,447, 
            458,459,460, 473,475,479, 487,488,489, 503, 511, 514,515,520,521, 543,544,567,586,587,588,591,592, 632, 659,660,677,678,
            695,696,698,719, 744,747, 748, 751, 752, 755,756, 774,775,776, 1134,1135, 1139, 1141, 1142, 1146,1147, 1148, 1152,
            1155, 1160, 1161, 1162, 1164, 1167, 1173, 1426,1438,1443,1448,1449,1458, 1461,1465,1470,1478,1484,1487
        ].indexOf(r) !== -1) return FA.faIcon(rrr+1);
        
        if ([666, 620, 653, 651, 701, 705, 706, 731, 732, 761, 766, 798, 808, 823, 824,
            861,864,866,897,898,933,958,959,961,965,969,973,977,989,992,997,
            1021,1023,1030,1040,1075,1076,1078,1081,1082,1084,1087,1089,1091,1093,1095,1099,
            1102,1104,1107,1112,1116,1119,1121,1122,1126,
            1182, 1197, 1203, 1208,1209,1210,1213,1214,1216,1218,1220,1229,1230,1235,1238,
            1239,1240,1241,1242,1243,1246,1247,1250,1251,
            1495, 1495,1498,1500,1503,1502,1505,1508,1511,1515,1518,1532,1533,1552,1555,
            1561,1567,1569,1582,1583,1584,1591,1595,1596,1601,1604,1607,1610,1615,1617,
            1619,1620,1621,1624,1629,1630,1630,1634,1636,1637,1638,1641,1642,1643,1645,
            1647,1652,1654,1656,1657,1659,1660,1663,1665,1666,1667,1668,1671,1672,1673,
            1686,1688,1689,1690,1691,1696,1697,1703,1709,
        ].indexOf(r) != -1) 
            return String.fromCharCode(0xf000 + r);

        if (r >= 1491) return FA.faIcon(rrr+1); // some non-existed in fa range

        if (r >= 1290 && r >= 1302) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 1176 && r >= 1273) return FA.faIcon(rrr+1); // some non-existed in fa range

        if (r >= 860 && r >= 1127) return FA.faIcon(rrr+1); // some non-existed in fa range
        

        if (r >= 781 && r <= 855) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 759 && r <= 769) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 723 && r <= 740) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 700 && r <= 710) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 681 && r <= 692) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 659 && r <= 668) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 635 && r <= 655) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 606 && r <= 624) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 570 && r <= 575) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 558 && r <= 562) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 524 && r <= 534) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 493 && r <= 501) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 463 && r <= 471) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 414 && r <= 426) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 393 && r <= 400) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 358 && r <= 385) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 274 && r <= 279) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 210 && r <= 213) return FA.faIcon(rrr+1); // some non-existed in fa range
        if (r >= 179 && r <= 191) return FA.faIcon(rrr+1); // some non-existed in fa range

        return String.fromCharCode(0xf000 + r);
    }
    
    static faIcon4 = (rrr = 0): string => { // fa-xxxx max value FA icons (v4.7) seems reside in a range 0-736
        if (rrr > 3) return String.fromCharCode(0xf000);
        let r:number = Math.floor(Math.random() * 736);

        if ([735, 719, 703, 687, 671, 655, 639, 623, 607, 591, 575, 544, 543, 527, 511, 495, 479,
            463, 447, 431, 415, 399, 383, 367, 351, 335, 319, 303, 287, 279, 278, 271, 255, 239,
            223, 207, 175, 159, 143
        ].indexOf(r) !== -1) return FA.faIcon4(rrr+1);

        if (r >= 179 && r <= 191) return FA.faIcon4(rrr+1); // some non-existed in fa range

        return String.fromCharCode(0xf000 + r);
    }    
}