export declare class OpenskyTokenManager {
    private clientId;
    private clientSecret;
    private accessToken;
    private tokenExpiry;
    constructor(clientId: string, clientSecret: string);
    getAccessToken(): Promise<string>;
}
export declare function fetchOpenskyStates(tokenManager: OpenskyTokenManager): Promise<any>;
