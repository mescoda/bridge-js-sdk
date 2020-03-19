
export default {
    callHandler(actionName, params, callback, mockData = {}) {
        return callback(mockData);
    },

    registerHandler(eventName, callback) {
        // use event emitter to communicate with window
    }
};
