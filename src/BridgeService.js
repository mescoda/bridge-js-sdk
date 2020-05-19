
import Bridge from './Bridge';

let instance = null;

export default {
    init: function (options) {
        const initPromise = new Promise(function (resolve, reject) {
            if (instance) {
                return resolve(instance);
            }
            instance = new Bridge(options);
            instance.ready(function () {
                resolve(instance);
            });
        });

        // Timeout if bridge not inited
        const timeoutPromise = new Promise(function (resolve, reject) {
            const error = new Error('Bridge init failed.');
            setTimeout(function () {
                reject(error);
            }, options.initTimeout || 500);
        });

        return Promise.race([initPromise, timeoutPromise]);
    },
    getInstance: function (options) {
        if (!instance) {
            throw new Error('Bridge instance not found.');
        }
        return instance;
    }
};
