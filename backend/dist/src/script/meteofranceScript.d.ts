import { OnModuleInit } from "@nestjs/common";
import { ApiService } from "../ApiService";
export declare class CallMeteofranceAPI implements OnModuleInit {
    private readonly ApiService;
    constructor(ApiService: ApiService);
    onModuleInit(): Promise<void>;
}
