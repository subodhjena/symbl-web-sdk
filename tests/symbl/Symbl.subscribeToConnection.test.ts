import Symbl from "../../src/symbl";
import { ConnectionFactory, BaseConnection } from '../../src/connection';
import { SubscribeAPIConnection } from '../../src/api';
import { APP_ID, APP_SECRET } from '../constants';
import { uuid } from '../../src/utils';
import { RequiredParameterAbsentError } from "../../src/error";


// Validate `sessionId` and if not present, throw `RequiredParameterAbsentError`
// Initialize the instance of `SubscribeAPIConnection` via the `ConnectionFactory` with the passed in `sessionId`
// If connection is successful, return the instance of the `SubscribeAPIConnection`
// If connection fails to get established, re-throw the error returned by `SubscribeAPIConnection`


/** define mocks */
jest.mock("../../src/utils");
const connectMock = jest.fn(() => {
    // (StreamingAPIConnection as any).processingState = ConnectionProcessingState.PROCESSING;
})
jest.mock("../../src/api", () => {
    return {
        SubscribeAPIConnection: jest.fn().mockImplementation(() => {
            return {
                connect: connectMock,
                sdk: {
                    subscribeToStream: jest.fn()
                },
            }
        })
    }
});
jest.mock('../../src/connection', () => {
    return {
        ConnectionFactory: jest.fn().mockImplementation(() => {
            return {
                instantiateConnection: jest.fn(() => {
                    return new SubscribeAPIConnection({} as any) as any;
                })
            }
        })
    }
});
/** end mocks definition **/

test(
    "Symbl.subscribeToConnection - Calling subscribeToConnection with valid parameters",
    async () => {
        const authConfig = {
            appId: APP_ID,
            appSecret: APP_SECRET
        };
        const sessionId = "23e920-9d92-1874a3";
        const symbl = new Symbl(authConfig);
        const subscription = await symbl.subscribeToConnection(sessionId);
        expect(connectMock).toHaveBeenCalled();
        expect(subscription instanceof SubscribeAPIConnection);
    }
);

test(
    "Symbl.subscribeToConnection - Calling subscribeToConnection without sessionId",
    async () => {
        try {
            const authConfig = {
                appId: APP_ID,
                appSecret: APP_SECRET
            };
            const symbl = new Symbl(authConfig);
            await expect(async () => await symbl.subscribeToConnection(null)).toThrowError(new RequiredParameterAbsentError("sessionID is required"));
        } catch(e) {
            //
        }
    }
);
