
import browserBridge from './browserBridge';

import log from './log';


export default class Bridge {

    constructor(options) {

        this.clientType = options.clientType;

        /**
         * iOS brdige type
         *
         * WebViewJavascriptBridge for https://github.com/marcuswestin/WebViewJavascriptBridge
         * WKWebViewJavascriptBridge for https://github.com/Lision/WKWebViewJavascriptBridge
         *
         * @type {string}
         */
        this.iOSBridgeType = options.iOSBridgeType || 'WebViewJavascriptBridge';

        this.responseChecker = options.responseChecker || function (data) {
            return true;
        };

        this.responseTransformer = options.responseTransformer || function (response) {
            return response;
        };

        this.browserBridge = options.browserBridge || browserBridge;

        this.timeout = options.timeout || 200;

        this.status = 'inited';
    }

    /**
     * In Android webview, JsBridge will trigger the `WebViewJavascriptBridgeReady` event when bridge insert ready.
     *
     * @param {Function} callback ready callback
     * @return {void}
     */
    _androidReady(callback) {
        if (window.WebViewJavascriptBridge) {

            // Do not init twice
            if (!window.WebViewJavascriptBridge._messageHandler) {

                // Make sure init called when bridge.ready execute after `WebViewJavascriptBridgeReady`
                window.WebViewJavascriptBridge.init(function () {});
            }
            return callback(window.WebViewJavascriptBridge);
        }
        document.addEventListener(
            'WebViewJavascriptBridgeReady',
            function () {
                window.WebViewJavascriptBridge.init(function () {});
                callback(window.WebViewJavascriptBridge);
            },
            false
        );
    }


    /**
     * In iOS webview, WebViewJavascriptBridge will not insert bridge by default,
     * webview needs to invode the `__bridge_loaded__` using shouldStartLoadWithRequest
     *
     * @param {Function} callback ready callback
     * @return {void}
     */
    _iOSWVReady(callback) {
        if (window.WebViewJavascriptBridge) {
            return callback(window.WebViewJavascriptBridge);
        }

        if (window.WVJBCallbacks) {
            return window.WVJBCallbacks.push(callback);
        }

        window.WVJBCallbacks = [callback];

        const WVJBIframe = document.createElement('iframe');
        WVJBIframe.style.display = 'none';
        WVJBIframe.src = 'https://__bridge_loaded__';
        document.documentElement.appendChild(WVJBIframe);
        setTimeout(function () {
            document.documentElement.removeChild(WVJBIframe);
        }, 0);
    }


    /**
     * In iOS webview, WKWebViewJavascriptBridge will not insert bridge by default,
     * webview needs to invode the `__bridge_loaded__` using postMessage
     *
     * @param {Function} callback ready callback
     * @return {void}
     */
    _iOSWKWVReady(callback) {
        if (window.WKWebViewJavascriptBridge) {
            return callback(window.WKWebViewJavascriptBridge);
        }

        if (window.WKWVJBCallbacks) {
            return window.WKWVJBCallbacks.push(callback);
        }

        window.WKWVJBCallbacks = [callback];

        window.webkit.messageHandlers.iOS_Native_InjectJavascript.postMessage(null);
    }


    _browserReady(callback) {
        return callback(this.browserBridge);
    }


    ready(callback = function () {}) {
        switch (this.clientType) {
            case 'iOS':
                if (this.iOSBridgeType === 'WebViewJavascriptBridge') {
                    return this._iOSWVReady(callback);
                } else {
                    return this._iOSWKWVReady(callback);
                }
            case 'Android':
                return this._androidReady(callback);
            default:
                return this._browserReady(callback);
        }
    }


    _getBridge() {
        switch (this.clientType) {
            case 'iOS':
                if (this.iOSBridgeType === 'WKWebViewJavascriptBridge') {
                    return window.WKWebViewJavascriptBridge;
                }
                return window.WebViewJavascriptBridge;
            case 'Android':
                return window.WebViewJavascriptBridge;
            default:
                return this.browserBridge;
        }
    }


    /**
     * transform invoke raw response to structured data
     *
     * @param {Object} rawResponse rawResponse
     * @return {Object} response
     */
    _getInvokeResponse(rawResponse) {
        switch (this.clientType) {
            case 'iOS':
            case 'Android':
                return JSON.parse(rawResponse);
            default:
                return rawResponse;
        }
    }


    invoke(actionName, params = {}, mockData) {

        const apiPromise = new Promise((resolve, reject) => {

            const bridge = this._getBridge();

            if (!bridge) {
                return reject(new Error('Bridge not inited.'));
            }

            const callback = rawResponse => {
                try {
                    const response = this._getInvokeResponse(rawResponse);
                    if (!this.responseChecker(response)) {
                        reject(response);
                    }
                    else {
                        resolve(this.responseTransformer(response));
                    }
                } catch (e) {
                    reject(e);
                }
            };

            bridge.callHandler(actionName, params, callback, mockData);

        });

        const timeoutPromise = new Promise((resolve, reject) => {
            const error = new Error(`Requesting bridge method ${actionName} timeout.`);
            error.isTimeout = true;

            setTimeout(function () {
                reject(error);
            }, this.timeout);
        });

        return Promise.race([apiPromise, timeoutPromise]);
    }

    on(eventName, callback) {

        const bridge = this._getBridge();

        if (!bridge) {
            log('error', 'Bridge not inited.');
            return;
        }

        bridge.registerHandler(eventName, callback);

    }

}
