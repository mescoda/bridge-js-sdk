
# bridge-js-sdk

JS Bridge SDK for contacting between iOS(using WebViewJavascriptBridge) and Android(using JsBridge) Webviews.

Helps masking the API differences of the native bridge used by iOS and Android.


## Native Bridge Support

### iOS

https://github.com/marcuswestin/WebViewJavascriptBridge

https://github.com/Lision/WKWebViewJavascriptBridge


### Android

https://github.com/lzyzsd/JsBridge


## Installation

`npm i -S bridge-js-sdk`


## Usage

### init

in src/index.js

```js

BridgeService.init({

    // `iOS` or `Android` or `browser`
    clientType: 'iOS',

    // `WebViewJavascriptBridge` for marcuswestin/WebViewJavascriptBridge 
    // `WKWebViewJavascriptBridge` for Lision/WKWebViewJavascriptBridge
    iOSBridgeType: 'WebViewJavascriptBridge',

    responseChecker(response) {
        return response.status === 0;
    },

    responseTransformer(response) {
        return response.data;
    },

    // help testing in browser
    browserBridge: canMockNative
        ? {
            callHandler(actionName, params, callback, mockData = {
                status: 0,
                data: {}
            }) {
                return callback(mockData);
            }
        }
        : null
});

```


### ready

```js

BridgeService.init(options).then(function (bridge) {
    // bridge is ready
});

```


### invoke

```js

const bridge = BridgeService.getInstance();

bridge.invoke('requestNative', {
    action: 'notify',
    params: {
        type: 1
    }
}).then(function () {
});

```


### Register a handler

```js

const bridge = BridgeService.getInstance();

bridge.on('onClickTitleBar', function () {});

```
