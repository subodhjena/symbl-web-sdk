# Symbl Web SDK

You can read the docs for the Symbl Web SDK at https://docs.symbl.ai/docs/web-sdk/overview

>This feature is in the Beta phase. If you have any questions, ideas or suggestions please reach out to us at devrelations@symbl.ai.


The Web SDK is a Typescript application that allows you to add Symbl’s Conversation Intelligence into your JavaScript application directly into the browser. It provides a pre-defined set of classes for easy utilization of our Streaming and Subscribe APIs.

>The Web SDK is currently available with Symbl’s Streaming and Subscribe APIs.

## Supported Browsers
The following web browser supported with the Web SDK are given below: 

Operating System | Chrome | Edge | Firefox | Safari |
---------- | ------- | ------- | ------ | ------ |
macOS | ✅ | - | ✅ | ✅ | 
Windows | ✅ | ✅ | ✅ | ✅ |
Linux| ✅ | - | ✅ | ✅ | 


## Prerequisites

Before using the Web SDK you must [Sign up with Symbl.ai](https://platform.symbl.ai) to generate your own App ID and App Secret values, which is used for authentication.

## Installation

### Using npm

Install the Web SDK using `npm` with the following command:

```shell
npm i  @symblai/symbl-web-sdk
```

### CDN

You can also import the file into your HTML appliaction using our CDN.

#### Versioned CDN

```html
<script src="https://sdk.symbl.ai/js/beta/symbl-web-sdk/v1.0.3/symbl.min.js"></script>
```

#### Latest CDN

```html
<script src="https://sdk.symbl.ai/js/beta/symbl-web-sdk/latest/symbl.min.js"></script>
```

You would then access the `Symbl` class via the `window` method:

```js
const Symbl = window.Symbl;
const symbl = new Symbl({
  accessToken: "< YOUR ACCESS TOKEN >"
});
```

>For production environments we recommend using the Versioned CDN.


### Importing

You can import the Web SDK in via Browser, ES5 and ES6 syntax:

#### ES6
```js
import {Symbl} from '@symblai/symbl-web-sdk';
```

#### ES5
```js
const {Symbl} = require('@symblai/symbl-web-sdk');
```

#### Browser

```js
const {Symbl} = window;
```


## Authentication

To initialize the Web SDK, you can pass in an access token generated using [Symbl’s Authentication method](https://docs.symbl.ai/docs/developer-tools/authentication/). Alternatively, you can use the App ID and App Secret from the [Symbl Platform](https://platform.symbl.ai). **Using the App ID and App Secret is not meant for production usage, as those are meant be secret.**


The code given below initializes the Web SDK:

```js
const symbl = new Symbl({
    accessToken: '<your Access Token>'
    // appId: '<your App ID>', // Should only be used for development environment
    // appSecret: '<your App Secret>', // Should only be used for development environment
    // basePath: '<your custom base path>',// optional
    // logLevel: 'debug' // Sets which log level you want to view
});
```

## Getting Started

In order to get started with the Symbl Web SDK we will start with a basic Hello World implementation

### Create a Hello World Application

This example will open up a WebSocket connection with the Symbl Streaming API and start processing audio data from the default input device. After 60 seconds the audio will stop being processed and the WebSocket connection will be closed. This is basic usage of the Symbl Streaming API simplified into a few lines a code.

View the [Importing](#importing) section for the various ways to import the Web SDK.

```js
(async () => {

  try {

      // We recommend to remove appId and appSecret authentication for production applications.
      // See authentication section for more details
      const symbl = new Symbl({
          appId: '<your App ID>',
          appSecret: '<your App Secret>',
          // accessToken: '<your Access Toknen>'
      });
      
      // Open a Symbl Streaming API WebSocket Connection.
      const connection = await symbl.createConnection();
      
      // Start processing audio from your default input device.
      await connection.startProcessing();

      // Retrieve real-time transcription from the conversation
      connection.on("speech_recognition", (speechData) => {
        const { punctuated } = speechData;
        const name = speechData.user ? speechData.user.name : "User";
        console.log(`${name}: `, punctuated.transcript);
      });

      // Retrieve the topics of the conversation in real-time.
      connection.on("topic", (topicData) => {
        topicData.forEach((topic) => {
          console.log("Topic: " + topic.phrases);
        });
      });
      
      // This is just a helper method meant for testing purposes.
      // Waits 60 seconds before continuing to the next API call.
      await Symbl.wait(60000);
      
      // Stops processing audio, but keeps the WebSocket connection open.
      await connection.stopProcessing();
      
      // Closes the WebSocket connection.
      connection.disconnect();
  } catch(e) {
      // Handle errors here.
  }
})();
```

## Read more

You can read the docs for the Symbl Web SDK at https://docs.symbl.ai/docs/web-sdk/overview


- [Getting Live Transcripts and Conversation Intelligence](https://docs.symbl.ai/docs/web-sdk/web-sdk-getting-live-transcripts/)
- [Sending external Audio Streams](https://docs.symbl.ai/docs/web-sdk/web-sdk-sending-external-audio-streams/)
- [Updating Audio Source Mid-Stream](https://docs.symbl.ai/docs/web-sdk/web-sdk-updating-audio-streams/)


## Known Issues

In this version of the Web SDK, a few Known Issues have been observed. You can see the complete list of Known Issues [here](https://docs.symbl.ai/docs/changelog/#known-issues). You can also keep track of these issues as they are addressed via the Issues tab of the github repo [here](https://github.com/symblai/symbl-web-sdk/issues).
