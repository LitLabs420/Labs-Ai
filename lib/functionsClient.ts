"use client";

import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase";

const functions = getFunctions(app, "us-central1");

export interface MoneyTodayActionClient {
  title: string;
  description: string;
  assetsNeeded: string[];
  scripts: {
    postCaption: string;
    dmText: string;
    storyScript: string;
  };
}

export interface MoneyTodayClientResponse {
  planId: string;
  summary: string;
  todayPlan: MoneyTodayActionClient[];
}

export async function callGenerateMoneyToday(input?: {
  businessType?: string;
  idealClients?: string;
  audienceSize?: string;
  availabilityToday?: string;
  promosRunning?: string;
}): Promise<MoneyTodayClientResponse> {
  const fn = httpsCallable(functions, "generateMoneyToday");
  const res: any = await fn(input || {});
  return {
    planId: res.data.planId,
    summary: res.data.moneyPlan.summary,
    todayPlan: res.data.moneyPlan.todayPlan,
  };
}

export async function callCreateCheckoutSession(plan: "growth" | "godmode") {
  const fn = httpsCallable(functions, "createCheckoutSession");
  const res: any = await fn({
    plan,
    successUrl: `${window.location.origin}/dashboard?upgraded=${plan}`,
    cancelUrl: `${window.location.origin}/pricing`,
  });
  return res.data.url;
}

export async function callGenerateOnboardingResponse(
  step: string,
  userInput: string,
  businessProfile?: any
) {
  const fn = httpsCallable(functions, "generateOnboardingResponse");
  const res: any = await fn({
    step,
    userInput,
    businessProfile,
  });
  return res.data;
}
