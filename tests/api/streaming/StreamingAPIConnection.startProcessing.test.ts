import Symbl from "../../../src/symbl";
import { LINEAR16AudioStream } from "../../../src/audio";
import { StreamingAPIConnection } from '../../../src/api';
import { NoConnectionError } from "../../../src/error";
import { APP_ID, APP_SECRET } from '../../constants';
import { ConnectionState, ConnectionProcessingState } from "../../../src/types/connection"

let validConnectionConfig, invalidConnectionConfig, authConfig, symbl, streamingAPIConnection;
beforeEach(() => {
    authConfig = {
        appId: APP_ID,
        appSecret: APP_SECRET
    };
    symbl = new Symbl(authConfig);
    validConnectionConfig = {
        insightTypes: ['action_item', 'question'],
        config: {
            meetingTitle: 'My Test Meeting',
            confidenceThreshold: 0.7,
            timezoneOffset: 480,
            languageCode: 'en-US',
        },
        speaker: {
            userId: 'emailAddress',
            name: 'My name'
        },
    };
    
    const audioContext = new AudioContext();
    const sourceNode = audioContext.createMediaStreamSource(new MediaStream());
    const audioStream = new LINEAR16AudioStream(sourceNode);
    streamingAPIConnection = new StreamingAPIConnection(validConnectionConfig.id, audioStream); 
    streamingAPIConnection.stream = {
        start: jest.fn(() => {
            return new Promise(res => {
                setTimeout(res, 1000);
            });
        })
    }
});


// If the `connectionState` is not CONNECTED, throw `NoConnectionError` with appropriate error message
// If `startRequestData` is passed in, validate it and in failure to do so, throw the appropriate error emmited by validateConfig.
// If `processingState` is PROCESSING or ATTEMPTING, then log a warning stating an attempt to `startProcessing` on a connection that is already processing or has already initiated the call.
// Else, set the value of `processingState` to ATTEMPTING and invoke the `start` function on the `stream` reference with startRequestData if present.
// Set the value of `processingState` to PROCESSING if the call is successful
// Set the value of `_isProcessing` to `true` and emit the appropriate event
// Any failure to send the `start_request` should be caught, handled and re-thrown with appropriate error class.
// Return from function

test(
    "StreamingAPIConnection.startProcessing - Testing a successful startProcessing call",
    (done) => {
        streamingAPIConnection.processingState = ConnectionProcessingState.NOT_PROCESSING;
        streamingAPIConnection.connectionState = ConnectionState.CONNECTED;
        const streamSpy = jest.spyOn(streamingAPIConnection.stream, 'start');
        const validationSpy = jest.spyOn(StreamingAPIConnection, 'validateConfig');
        const attachStreamSpy = jest.spyOn(streamingAPIConnection, 'attachAudioStream');
        streamingAPIConnection.startProcessing(validConnectionConfig).then(() => {
            expect(streamingAPIConnection.processingState).toBe(ConnectionProcessingState.PROCESSING);
            expect(streamingAPIConnection.isProcessing()).toBe(true);
            expect(streamSpy).toBeCalledTimes(1);
            expect(validationSpy).toBeCalledTimes(1);
            expect(validationSpy).toBeCalledWith(validConnectionConfig);
            expect(attachStreamSpy).toBeCalledTimes(1);
            done();
        });
    }
);


test(
    "StreamingAPIConnection.startProcessing - Testing an unsuccessful startProcessing call",
    async () => {
        streamingAPIConnection.stream = {
            start: jest.fn(() => {
                throw new Error("An error happened.");
            })
        }
        const startRequestData = {
            type: "start_request"
        }
        streamingAPIConnection.processingState = ConnectionProcessingState.NOT_PROCESSING;
        streamingAPIConnection.connectionState = ConnectionState.CONNECTED;
        const streamSpy = jest.spyOn(streamingAPIConnection.stream, 'start');
        await expect(async () => await streamingAPIConnection.startProcessing(startRequestData)).rejects.toThrow();
    }
);

test(
    "StreamingAPIConnection.startProcessing - Testing an unsuccessful startProcessing validation",
    async () => {
        // try {
            // StreamingAPIConnection.validateConfig = jest.fn(() => {
            //     throw new Error("An error happened.");
            // });
        // expect(true).toBe(false);
        // try {
        const startRequestData = {
            insightTypes: 3
        }
        streamingAPIConnection.processingState = ConnectionProcessingState.NOT_PROCESSING;
        streamingAPIConnection.connectionState = ConnectionState.CONNECTED;
        const streamSpy = jest.spyOn(streamingAPIConnection.stream, 'start');
        await expect(async () => await streamingAPIConnection.startProcessing(startRequestData)).rejects.toThrow();
    }
);

test(
    "StreamingAPIConnection.startProcessing - throw `NoConnectionError` if ConnectionState is not CONNECTED",
    async () => {
        const startRequestData = {
            type: "start_request"
        }
        streamingAPIConnection.processingState = ConnectionProcessingState.NOT_PROCESSING;
        streamingAPIConnection.connectionState = ConnectionState.DISCONNECTED;
        const startSpy = jest.spyOn(streamingAPIConnection.stream, 'start');
        await expect(async() => await streamingAPIConnection.startProcessing(validConnectionConfig)).rejects.toThrow();
        expect(startSpy).toBeCalledTimes(0);
    }
);

test(
    "StreamingAPIConnection.startProcessing - Attempt a connection when processingState is ATTEMPTING",
    async () => {
        streamingAPIConnection.connectionState = ConnectionState.CONNECTED;
        streamingAPIConnection.processingState = ConnectionProcessingState.ATTEMPTING;
        const warnSpy = jest.spyOn(streamingAPIConnection.logger, 'warn');
        await streamingAPIConnection.startProcessing(validConnectionConfig);
        expect(warnSpy).toBeCalledTimes(1);
        const startSpy = jest.spyOn(streamingAPIConnection.stream, 'start');
        expect(startSpy).toBeCalledTimes(0);
    }
);

test(
    "StreamingAPIConnection.startProcessing - Attempt a connection when processingState is PROCESSING",
    async () => {
        streamingAPIConnection.connectionState = ConnectionState.CONNECTED;
        streamingAPIConnection.processingState = ConnectionProcessingState.PROCESSING;
        const warnSpy = jest.spyOn(streamingAPIConnection.logger, 'warn');
        await streamingAPIConnection.startProcessing(validConnectionConfig);
        expect(warnSpy).toBeCalledTimes(1);
        const startSpy = jest.spyOn(streamingAPIConnection.stream, 'start');
        expect(startSpy).toBeCalledTimes(0);
    }
);