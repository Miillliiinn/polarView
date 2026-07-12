import { OnModuleInit } from "@nestjs/common";
import { ApiService } from "../app.service";
export declare class CallSncfAPI implements OnModuleInit {
    private readonly ApiService;
    constructor(ApiService: ApiService);
    onModuleInit(): Promise<void>;
}
