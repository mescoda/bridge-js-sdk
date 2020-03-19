
import Bridge from './Bridge';

let instance = null;

export default {
    init: function (options) {
        if (!instance) {
            instance = new Bridge(options);
            instance.ready();
        }
        return instance;
    },
    getInstance: function (options) {
        if (!instance) {
            instance = new Bridge(options);
            instance.ready();
        }
        return instance;
    }
};
