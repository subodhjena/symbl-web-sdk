import Symbl from "../../src/symbl";
import { ConnectionFactory, BaseConnection } from '../../src/connection';
import { LINEAR16AudioStream, OpusAudioStream } from '../../src/audio';
import { StreamingAPIConnection  } from "../../src/api";
import { InvalidValueError, NotSupportedSampleRateError, SessionIDNotUniqueError  } from "../../src/error";
import { APP_ID, APP_SECRET } from '../constants';
import { uuid } from '../../src/utils';
import { SymblConnectionType } from '../../src/types';

// Validate `options` with the `StreamingAPIConnectionConfig` interface
// Validate `id` as a `uuid` or its `uniqueness` and if it doesn't conform, reject the request with `SessionIDNotUniqueError`
// If no `id` is present in the options, log a warning and assign a `uuid`
// Establish a new Streaming API Connection via the `ConnectionFactory`, creating an instance of the `StreamingAPIConnection`
// Invoke the `connect` function to establish an idle connection with Streaming API. (It will not process Audio in this state)
// If the Connection establishment fails, throw the appropriate error generated by the `StreamingAPIConnection` interface.
// Return the connection instance


/** define mocks */
jest.mock("../../src/utils");
jest.mock("symbl-opus-encdec");
const startProcessingMock = jest.fn(() => {
    // (StreamingAPIConnection as any).processingState = ConnectionProcessingState.PROCESSING;
});
const connectMock = jest.fn();
jest.mock("../../src/api", () => {
    return {
        StreamingAPIConnection: jest.fn().mockImplementation(() => {
            return {
                connect: connectMock,
                startProcessing: startProcessingMock,
                sdk: {
                    createStream: jest.fn()
                },
                stream: {
                    start: jest.fn()
                }
            }
        })
    }
});
jest.mock('../../src/connection', () => {
    return {
        ConnectionFactory: jest.fn().mockImplementation(() => {
            return {
                instantiateConnection: jest.fn(() => {
                    return new StreamingAPIConnection({} as any, {} as any) as any;
                })
            }
        })
    }
})
/** end mocks definition **/



test(
    "Symbl.createConnection - Calling createConnection with valid config without passing AudioStream",
    async () => {
        const authConfig = {
            appId: APP_ID,
            appSecret: APP_SECRET
        };

        const symbl = new Symbl(authConfig);
        const connectionId = null;
        // const connectionConfig = {
        //     insightTypes: ['action_item', 'question'],
        //     config: {
        //         meetingTitle: 'My Test Meeting',
        //         confidenceThreshold: 0.7,
        //         timezoneOffset: 480,
        //         languageCode: 'en-US',
        //     },
        //     speaker: {
        //         userId: 'emailAddress',
        //         name: 'My name'
        //     },
        // };
        const connection = await symbl.createConnection(connectionId);
        expect(ConnectionFactory).toHaveBeenCalled();
        // expect(ConnectionFactory).toHaveBeenCalledWith(SymblConnectionType.STREAMING, connectionId, null);
        expect(connectMock).toBeCalledTimes(1);
        expect(uuid).toBeCalledTimes(1);
        expect(startProcessingMock).toBeCalledTimes(0);
        expect(connection instanceof StreamingAPIConnection);
    }
);

test(
    "Symbl.createConnection - Calling createConnection with valid config that contains an id",
    async () => {
        const authConfig = {
            appId: APP_ID,
            appSecret: APP_SECRET
        };
        const id = "123940-2390394-19848598";
        const symbl = new Symbl(authConfig);
        // const connectSpy = jest.spyOn(Connection)
        const connection = await symbl.createConnection(id);
        expect(ConnectionFactory).toHaveBeenCalled();
        expect(connectMock).toBeCalledTimes(1);
        expect(uuid).toBeCalledTimes(0);
        expect(startProcessingMock).toBeCalledTimes(0);
        expect(connection instanceof StreamingAPIConnection);
    }
);

test(
    "Symbl.createConnection - Calling createConnection with valid config and passing in LINEAR16AudioStream",
    async () => {
        const authConfig = {
            appId: APP_ID,
            appSecret: APP_SECRET
        };
        const context = new AudioContext();
        const mediaStream = new MediaStream();
        const sourceNode = context.createMediaStreamSource(mediaStream);
        const audioStream = new LINEAR16AudioStream(sourceNode);
        const symbl = new Symbl(authConfig);
        const connection = await symbl.createConnection(null, audioStream);
        expect(ConnectionFactory).toHaveBeenCalled();
        expect(connectMock).toBeCalledTimes(1);
        expect(uuid).toBeCalledTimes(1);
        expect(startProcessingMock).toBeCalledTimes(0);
        expect(connection instanceof StreamingAPIConnection);
    }
);

test(
    "Symbl.createConnection - Calling createConnection with valid config and passing in OpusAudioStream",
    async () => {
        const authConfig = {
            appId: APP_ID,
            appSecret: APP_SECRET
        };
        const opusConfig: any = {
            numberOfChannels: 1,
            encoderSampleRate: 48000,
            encoderFrameSize: 20,
            maxFramesPerPage: 40,
            encoderComplexity: 6,
            streamPages: true,
            rawOpus: true
        };
        const context = new AudioContext();
        const mediaStream = new MediaStream();
        const sourceNode = context.createMediaStreamSource(mediaStream);
        const audioStream = new OpusAudioStream(sourceNode, opusConfig);
        const symbl = new Symbl(authConfig);
        const connection = await symbl.createConnection(null, audioStream);
        expect(ConnectionFactory).toHaveBeenCalled();
        expect(connectMock).toBeCalledTimes(1);
        expect(uuid).toBeCalledTimes(1);
        expect(startProcessingMock).toBeCalledTimes(0);
        expect(connection instanceof StreamingAPIConnection);
    }
);

test(
    "Symbl.createConnection - Calling createConnection with invalid sessionID that is not a string",
    async () => {
        const authConfig = {
            appId: APP_ID,
            appSecret: APP_SECRET
        };
        const id = 123456789;
        const symbl = new Symbl(authConfig);
        await expect(async () => { await symbl.createConnection(id as any) }).rejects.toThrowError(new InvalidValueError("Session ID must be a string."));
    }
);

test(
    "Symbl.createConnection - Calling createConnection with invalid sessionID that is not properly formatted",
    async () => {
        const authConfig = {
            appId: APP_ID,
            appSecret: APP_SECRET
        };
        const id = "123_940-2390394-1984$8598";
        const symbl = new Symbl(authConfig);
        await expect(async () => { await symbl.createConnection(id as any) }).rejects.toThrowError(new SessionIDNotUniqueError("Session ID should be a unique combination of numbers and characters or a UUID."));
    }
);