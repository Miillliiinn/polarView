import { OnModuleInit } from "@nestjs/common";
import { ApiService } from "../app.service";
export declare class CallOpenskyAPI implements OnModuleInit {
    private readonly ApiService;
    constructor(ApiService: ApiService);
    onModuleInit(): Promise<void>;
}
