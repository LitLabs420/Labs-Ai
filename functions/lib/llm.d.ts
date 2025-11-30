export interface MoneyTodayRequest {
    businessType: string;
    idealClients: string;
    audienceSize: string;
    availabilityToday: string;
    promosRunning: string;
    plan: "free" | "growth" | "godmode";
}
export interface MoneyTodayAction {
    title: string;
    description: string;
    assetsNeeded: string[];
    scripts: {
        postCaption: string;
        dmText: string;
        storyScript: string;
    };
}
export interface MoneyTodayResponse {
    summary: string;
    todayPlan: MoneyTodayAction[];
}
export declare function generateMoneyTodayLLM(req: MoneyTodayRequest): Promise<MoneyTodayResponse>;
//# sourceMappingURL=llm.d.ts.map