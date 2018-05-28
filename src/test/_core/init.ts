import {chai, assert} from "../test.commons"
import {Managerist} from "../../app";
import {Technology} from "../../models/technology";

describe('Init test', () => {
    it('app should be instantiated', () => {
        let isApp = !!Managerist.app;

        isApp.should.equal(true);
    });


    it('Knowledge branches loaded within 1.0s', async () => {
        let branches = await (() => new Promise((rs ,rj) => {
                let attempts = 0,
                    check = () => {
                        if (Managerist.app.isReady) {
                            return rs(Technology.branches);
                        }
                        if (++attempts > 3) {
                            return rj(new Error('Failed'));
                        }
                        setTimeout(check, 300*attempts);
                    };
                check();
            })
        )();
        return branches.should.have.length.greaterThan(3);
    });
});
