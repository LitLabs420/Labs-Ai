import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import OpenAI from "openai";
import Stripe from "stripe";
import { generateMoneyTodayLLM, MoneyTodayRequest } from "./llm";

// Initialize
admin.initializeApp();
const db = admin.firestore();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20",
});

const STRIPE_PRICE_IDS = {
  growth: process.env.STRIPE_PRICE_GROWTH || "price_growth_placeholder",
  godmode: process.env.STRIPE_PRICE_GODMODE || "price_godmode_placeholder",
};

// ===== MONEY TODAY =====
export const generateMoneyToday = functions.https.onCall(
  async (data: any, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in."
      );
    }

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User not found");
    }

    const userData = userDoc.data() as any;
    const plan = (userData.plan as "free" | "growth" | "godmode") || "free";

    const req: MoneyTodayRequest = {
      businessType:
        data.businessType || userData.businessType || "beauty pro / creator",
      idealClients:
        data.idealClients || userData.idealClients || "local high-quality clients",
      audienceSize: data.audienceSize || userData.audienceSize || "small audience",
      availabilityToday:
        data.availabilityToday || userData.availabilityToday || "2 hours",
      promosRunning: data.promosRunning || userData.promosRunning || "none",
      plan,
    };

    const moneyPlan = await generateMoneyTodayLLM(req);

    // Save to Firestore
    const ref = db
      .collection("moneyTodayPlans")
      .doc(uid)
      .collection("runs")
      .doc();

    await ref.set({
      ...moneyPlan,
      planUsed: plan,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      input: req,
    });

    return {
      planId: ref.id,
      moneyPlan,
    };
  }
);

// ===== STRIPE CHECKOUT =====
export const createCheckoutSession = functions.https.onCall(
  async (data: any, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError("unauthenticated", "Not signed in");
    }

    const plan = data.plan as "growth" | "godmode";
    if (!plan || !["growth", "godmode"].includes(plan)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid plan"
      );
    }

    const priceId = STRIPE_PRICE_IDS[plan];

    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data() || {};
    const email = userData.email || "";

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        client_reference_id: uid,
        success_url: data.successUrl || "https://litlabs-web.vercel.app/dashboard?upgraded=true",
        cancel_url: data.cancelUrl || "https://litlabs-web.vercel.app/pricing",
      });

      return {
        url: session.url,
      };
    } catch (err: any) {
      console.error("Stripe checkout error:", err);
      throw new functions.https.HttpsError(
        "internal",
        err.message || "Failed to create checkout session"
      );
    }
  }
);

// ===== STRIPE WEBHOOK =====
export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    res.status(400).send("Missing stripe-signature header");
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const uid = session.client_reference_id;

      if (uid) {
        const subscriptionId = session.subscription as string;

        if (subscriptionId) {
          const subs = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subs.items.data[0]?.price.id;

          let planToSet: "growth" | "godmode" | null = null;
          if (priceId === STRIPE_PRICE_IDS.growth) planToSet = "growth";
          if (priceId === STRIPE_PRICE_IDS.godmode) planToSet = "godmode";

          if (planToSet) {
            await db.collection("users").doc(uid).update({
              plan: planToSet,
              stripeSubscriptionId: subscriptionId,
              upgradeDate: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`User ${uid} upgraded to plan: ${planToSet}`);
          }
        }
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===== ONBOARDING CHATBOT =====
export const generateOnboardingResponse = functions.https.onCall(
  async (data: any, context) => {
    const uid = context.auth?.uid;
    if (!uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be signed in."
      );
    }

    const { step, userInput, businessProfile } = data;

    // Simple conversation engine - can be expanded
    let systemPrompt = "";
    let userPrompt = "";

    if (step === "welcome") {
      return {
        step: "business_type",
        message:
          "Yo, I'm LitLabs OS 👋🏽\nYour AI command center for clients, content, and money.\n\nWho am I helping? (Like: 'lash tech in Detroit', 'barber', 'nail artist online', etc.)",
      };
    }

    if (step === "business_type") {
      return {
        step: "ideal_clients",
        message: `Got it. You're a ${userInput}.\n\nNow tell me about your ideal clients.\nWho do you actually want more of?`,
      };
    }

    if (step === "ideal_clients") {
      return {
        step: "struggle",
        message: `Perfect.\n\nWhat's your biggest struggle right now?\n- Not enough bookings\n- Too many cheap price-shoppers\n- Inconsistent with posting\n- Don't know what to post\n- Freeze up on DMs\n- Something else`,
      };
    }

    if (step === "struggle") {
      return {
        step: "money_goal",
        message: `I feel that.\n\nIf this actually worked, what's a real goal that would make you hype?\n(Like: '$3k/month', '10 new clients/month', 'fill my Saturdays solid')`,
      };
    }

    if (step === "money_goal") {
      return {
        step: "availability",
        message: `That's solid.\n\nHow much energy you got for your business right now?\n- Tired but ready to move a little\n- I can go hard\n- Only 1-2 hours a day`,
      };
    }

    if (step === "availability") {
      // Generate personalized summary
      const summary = `Alright, here's what I'm seeing 👇🏽\n- You're ${businessProfile.businessType}\n- You want more ${businessProfile.idealClients}\n- Struggle: ${businessProfile.struggle}\n- Goal: ${businessProfile.moneyGoal}\n- Energy: ${userInput}\n\nSound about right?`;

      return {
        step: "summary_confirm",
        message: summary,
      };
    }

    if (step === "first_win_choice") {
      return {
        step: "first_win",
        message: `Cool. Let's get you a win you can use TODAY. What do you want first?\n- 7-day content game plan\n- DM script that books clients\n- Make me money today (SOS button)`,
      };
    }

    // Save profile to Firestore
    if (businessProfile && Object.keys(businessProfile).length > 0) {
      await db.collection("users").doc(uid).update({
        businessProfile,
        onboardingCompleted: true,
        onboardingCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      step: "complete",
      message: "Onboarding complete. You're all set!",
    };
  }
);

// Health check
export const health = functions.https.onCall(async (data, context) => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// ===== AUTO-CREATE USER DOCUMENT ON SIGNUP =====
export const createUserOnSignup = functions.auth.user().onCreate(
  async (user: admin.auth.UserRecord) => {
    try {
      const userRef = db.collection("users").doc(user.uid);
      
      await userRef.set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0] || "User",
        photoURL: user.photoURL || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        tier: "free",
        plan: "free",
        status: "active",
        businessProfile: {},
        onboardingCompleted: false,
      }, { merge: true });

      console.log(`User document created for ${user.uid}`);
    } catch (error) {
      console.error("Error creating user document:", error);
      throw error;
    }
  }
);
