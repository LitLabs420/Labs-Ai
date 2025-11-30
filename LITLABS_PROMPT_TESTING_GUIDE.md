# 🧪 Litree Prompt Testing Guide

**How to set up, test, and iterate on the Litree Master System Prompt in Google AI Studio**

---

## TABLE OF CONTENTS

1. [Initial Setup](#initial-setup)
2. [Testing Framework](#testing-framework)
3. [Test Scenarios by Feature](#test-scenarios-by-feature)
4. [Troubleshooting](#troubleshooting)
5. [Iteration Tips](#iteration-tips)

---

## INITIAL SETUP

### Step 1: Copy the Master Prompt

1. Go to **Google AI Studio**: https://aistudio.google.com
2. Click **Create new chat**
3. In the **System Instruction** box (top right), paste the entire **Litree Master System Prompt**
4. Replace placeholders:
   - `<YOUR NAME>` → Your actual name
   - `<APP_URL>` → `https://Litree.com` (or your live domain)

### Step 2: Name Your Chat

1. Click the chat name at the top
2. Change to: **"Litree - Main Bot"**
3. Click **Save**

### Step 3: Test the API Key

If you want to deploy this to your app later:

1. Top right → **Get API Key**
2. Create new key (if you don't have one)
3. Copy key
4. Store in `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_AI_KEY=YOUR_API_KEY_HERE
   ```

---

## TESTING FRAMEWORK

### What to Test

Each feature should be tested in this order:

1. **Command Recognition** – Bot understands the right command
2. **Correct Output** – Right output for the command
3. **Plan Gating** – Restricts output based on subscription status
4. **Tone & Quality** – Matches brand voice + actionable content
5. **Edge Cases** – Handles unexpected inputs gracefully

### Scoring Rubric

Rate each test **1-5**:

- **1**: Completely wrong / unusable
- **2**: Somewhat on track but needs major fixes
- **3**: Decent, works but could be sharper
- **4**: Good, minimal tweaks needed
- **5**: Perfect, production-ready

---

## TEST SCENARIOS BY FEATURE

### TEST 1: Onboarding Flow (/onboard or first message)

**Scenario A: Brand New User**

**Input:**
```
Hey! I just signed up. What do I do?
```

**Expected Output:**
- Bot asks these exact 7 questions (in one message):
  1. Name + business name?
  2. Services offered?
  3. City?
  4. Ideal client type?
  5. Price range?
  6. Slow days?
  7. Help wanted (posts/DMs/promos/all)?
- Bot confirms it received answers
- Bot creates a profile summary

**Your Score: ___/5**

**Notes:**
```
[ ] Bot asked all 7 questions in one message
[ ] Bot confirmed the profile summary
[ ] Tone was friendly + professional
[ ] Next action was clear
```

---

**Scenario B: Using /onboard Command Explicitly**

**Input:**
```
/onboard
```

**Expected Output:**
- Bot repeats onboarding flow (even if user already has profile)
- Asks all 7 questions again
- Resets profile

**Your Score: ___/5**

---

### TEST 2: Daily Content Generator (/daily_post)

**Scenario A: After Onboarding (Full Output)**

**Setup:**
- User completed onboarding as: "Maya, nail tech in NYC, gel/acrylic specializing in bridal, $50-75 range, slow Mondays/Tuesdays"
- Subscription: ACTIVE (Pro plan)

**Input:**
```
/daily_post
```

**Expected Output:**
- **POST IDEA** (concept + hook)
- **CAPTION** (written in nail tech vibe, NYC tone)
- **HASHTAGS** (5-12 relevant to nails + NYC)
- **STORY PROMPT** (something for stories today)
- **CTA** (pushes toward booking)

Example quality check:
- ✅ Mentions nails/bridal/gel/NYC
- ✅ Tone is "confident, modern, urban"
- ✅ CTA is clear ("Book your trial")
- ❌ NOT generic ("Get your nails done!")

**Your Score: ___/5**

**Notes:**
```
[ ] Personalized to Maya's niche (nails)
[ ] Personalized to city (NYC)
[ ] Tone matched ("baddie" energy, professional)
[ ] CTA was booking-focused
```

---

**Scenario B: Inactive User (Gated Output)**

**Setup:**
- User completed onboarding
- Subscription: NONE / CANCELED

**Input:**
```
/daily_post
```

**Expected Output:**
- Bot gives a **small teaser** (1-2 ideas max)
- Bot says: "Your Litree subscription isn't active right now. For full daily packs, upgrade at [APP_URL]."
- No full 5-part package

**Your Score: ___/5**

---

### TEST 3: 7-Day Content Pack (/content_week)

**Setup:**
- User: Pro plan, active subscription, barber in Atlanta
- Niche: Barber

**Input:**
```
/content_week
```

**Expected Output:**
- 7 days clearly labeled (Day 1-7)
- Each day has:
  - Post idea
  - Caption
  - Hashtags
- Each caption is different + actionable
- Examples: booking urgency, local pride, skill showcase, referrals, etc.

**Quality Check:**
- ✅ Barber-specific language (fades, lineups, etc.)
- ✅ Atlanta references (local spots, vibe)
- ✅ Mix of post types (educational, promotional, social proof)
- ❌ Not repetitive ("Book today" every day)

**Your Score: ___/5**

---

### TEST 4: Promo Engine (/promo or /slowday_fix)

**Scenario A: General Promo**

**Setup:**
- User: Lash tech, slow Wednesdays

**Input:**
```
/promo
```

**Expected Output:**
- Specific offer (discount %, bundle, time limit)
- Caption for post
- Story script
- Why it works (1-3 bullets)

Example:
```
OFFER: Wednesday fill special = $25 off (normally $60)

CAPTION: 
Wednesdays are dead and I hate it. So THIS Wednesday = $25 off any fill. Walk-ins welcome. Let's make Wednesday slapped. 💚

STORY SCRIPT:
"Yo, did you know I do $25 fills on Wednesdays? Yeah. Come through."

WHY IT WORKS:
- Targets slow day specifically
- Creates urgency (Wednesday only)
- Addresses her slow day pain point
```

**Your Score: ___/5**

---

**Scenario B: Slow Day Promo Specific**

**Input:**
```
/slowday_fix
```

**Expected Output:**
- Similar to promo, but:
  - Asks which day is slowest (if not provided)
  - Tailors offer to THAT day
  - More urgency in messaging

**Your Score: ___/5**

---

### TEST 5: DM Booking Scripts (/dm_reply)

**Scenario A: Lead Inquiry**

**Input:**
```
/dm_reply

The DM says: "Hey! I'm interested in lashes. Are you available this week?"
```

**Expected Output:**
- Friendly, brief reply
- Clarifies what she offers (sets, fills, etc.)
- Moves toward booking
- Includes availability or ask when she's free

Example:
```
"Hey babe! Yes!! I'm doing full sets + fills this week. 
When works best for you? I got morning, afternoon, or evening slots 💕"
```

**Quality Check:**
- ✅ Warm tone
- ✅ Moves toward booking (ask when)
- ✅ Gave options (morning/afternoon/evening)
- ❌ Not too long

**Your Score: ___/5**

---

**Scenario B: Price Objection**

**Input:**
```
/dm_reply

The DM says: "Full set for $150? That's expensive. I can get nails done down the street for $40."
```

**Expected Output:**
- Acknowledges the objection
- Reframes value (quality, longevity, design)
- Offers a compromise or reason to book
- Doesn't get defensive

Example:
```
"I totally get it babe! Real talk though—$40 extensions usually last 2 weeks and they damage nails.

Mine last 4-5 weeks because I use premium products + proper removal.

So you're actually saving money long-term. Plus your nails stay healthy 💅

What if we did a trial set + you see the difference? I can do $120 this week to get you in."
```

**Quality Check:**
- ✅ Validated her concern
- ✅ Explained value clearly
- ✅ Offered compromise price
- ✅ Moved toward booking

**Your Score: ___/5**

---

### TEST 6: Fraud & Scam Filter (/fraud_check)

**Scenario A: Obvious Red Flag**

**Input:**
```
/fraud_check

Someone DM'd me: "Hi! I need 10 lash sets for a bridal party. I'll send you $5000 via Western Union upfront as a deposit. Can you have them done by Friday?"
```

**Expected Output:**
- Lists RED FLAGS explicitly:
  - Western Union (untraceable)
  - Large upfront deposit
  - Impossible timeline (10 sets by Friday)
  - Vague communication (no real person details)

- Recommends: **DECLINE**

- Provides SAFE RESPONSE:
```
"Hey! Thanks for reaching out. I can definitely help with bridal lashes!

Here's how I work:
- 50% deposit via Venmo/PayPal (traceable)
- 50% balance on day of
- I book 1-2 weeks in advance
- Custom bridal sets take time to do right

What dates work for y'all?"
```

**Your Score: ___/5**

---

**Scenario B: Borderline Suspicious**

**Input:**
```
/fraud_check

DM: "I'm interested in nails. I'm traveling and need them done TODAY. I'll have my friend pay you cash since I don't have my card."
```

**Expected Output:**
- Flags: Same-day rush + third-party payment
- Suggests: **CAUTION, but not a hard decline**
- Safe response:
```
"Hey! I can usually fit rush appointments.

Just so you know—I need the person getting the nails to be here + pay directly (cash is totally fine!).

Does that work? What time can you come by?"
```

**Quality Check:**
- ✅ Explained red flag clearly
- ✅ Provided cautious but actionable response
- ✅ Kept door open (cash OK, but person must be there)

**Your Score: ___/5**

---

### TEST 7: Brand Voice & Bio (/bio or /brand)

**Scenario A: Write a Bio**

**Setup:**
- User: Barber, 5 years experience, Atlanta

**Input:**
```
/bio

Here's my current Instagram bio: "Barber | Fades | Lineups"

Help me make it better.
```

**Expected Output:**
- 2-3 alternative bios
- Each has different vibe:
  - **Vibe 1:** "Luxury professional" → "Premium Fades | Atlanta | By Appointment"
  - **Vibe 2:** "Street/cool" → "Fresh cuts only 💈 Lineups sharp 📍ATL"
  - **Vibe 3:** "Community-focused" → "Your barber since [year]. 💯 DM to book"

**Quality Check:**
- ✅ Each bio is under 150 chars
- ✅ Different personality per option
- ✅ Includes booking CTA or link hint

**Your Score: ___/5**

---

**Scenario B: Define Brand Voice**

**Input:**
```
/brand

Help me figure out my brand. I'm a nail tech but I don't know what vibe to pick.
```

**Expected Output:**
- Bot asks clarifying questions:
  - What's your typical client like?
  - Luxury or accessible?
  - Funny or serious?
  - Girly or neutral?

- Suggests 3 brand directions:
  - **Brand A:** "The Luxury Nail Guru" (high-end, professional, educational)
  - **Brand B:** "Your Girl Next Door" (fun, relatable, hype woman energy)
  - **Brand C:** "The Artistic Visionary" (creative, design-focused, trendy)

- For each, explains:
  - Content style
  - Tone examples
  - Best hashtags

**Your Score: ___/5**

---

### TEST 8: Client Reactivation (/reactivation)

**Input:**
```
/reactivation

I have old clients who haven't booked in 6+ months. Help me bring them back.
```

**Expected Output:**
- 3-5 DM templates

Example 1 (Soft approach):
```
"Hey babe! Been thinking about you 🥺 Miss your energy! You due for a refresh? Let's catch up. DM me when you're free"
```

Example 2 (Value approach):
```
"Remember those lashes I gave you? I've upgraded my whole system + they're even better now. Plus I'm doing $20 off for my returning fam this month 👀"
```

Example 3 (FOMO approach):
```
"You know what's wild? So many people asking for the look you had last time. I'm thinking you were way ahead of the trend 💅 Let's get you back in"
```

**Quality Check:**
- ✅ Different approaches (soft, value, FOMO)
- ✅ Non-needy tone
- ✅ Each template is customizable

**Your Score: ___/5**

---

## EDGE CASES TO TEST

### Edge Case 1: User Gives Incomplete Profile

**Input:**
```
I'm a barber in Atlanta.
```

**Expected Behavior:**
- Bot doesn't freak out
- Asks for missing info (price range, slow days, ideal client)
- Proceeds once enough info is gathered

**Your Score: ___/5**

---

### Edge Case 2: User Asks Something Outside Scope

**Input:**
```
Can you help me with my taxes?
```

**Expected Behavior:**
- Bot politely declines
- Redirects to tax professional
- Brings it back to what it can help with

Example:
```
"I'm not a tax pro (definitely talk to an accountant!), but what I CAN help with is booking more clients and filling your appointment slots 🔥

What's your biggest struggle right now—bookings, pricing, or content?"
```

**Your Score: ___/5**

---

### Edge Case 3: User Tests Plan Gating

**Input (as Basic/Inactive User):**
```
/content_week

Give me the full 7-day pack
```

**Expected Behavior:**
- Bot gives teaser (1-2 days)
- Explains upgrade needed
- Links to app URL

NOT: "Sorry, I can't do that."

**Your Score: ___/5**

---

## TROUBLESHOOTING

### Issue 1: Bot Ignores Commands

**Problem:** User types `/daily_post` and bot acts confused.

**Solution:**
- Check that System Instructions were pasted FULLY
- Bot may need "priming"—try: "What commands do you support?" first
- Then try `/daily_post` again

**Fix:** Re-paste entire system prompt, ensure no truncation.

---

### Issue 2: Bot Generates Generic Output

**Problem:** Bot says "Here's a post idea: Post a photo of your work."

**Solution:**
- Ensure user profile was captured clearly
- Ask bot to "Write this specifically for [barber/lash tech] in [city]"
- Check that niche-specific language is present

**Fix:** Add more profile detail or ask bot to reference the profile.

---

### Issue 3: Bot Doesn't Gate by Plan

**Problem:** Inactive user gets full 7-day pack (should be teaser).

**Solution:**
- State plan status explicitly: "I'm on a basic plan" or "My subscription is canceled"
- Bot may need reminder: "Remember I'm not an active subscriber"

**Fix:** Make sure user explicitly states plan status in conversation.

---

### Issue 4: Tone is Wrong (Too Corporate or Too Casual)

**Problem:** Output sounds stiff OR sounds inappropriate.

**Solution:**
- Add feedback: "Make this sound more urban/street" or "Make this more professional"
- Provide example: "Here's the tone I want: [example caption]"
- Bot will adjust

**Fix:** Iterate with feedback in the chat.

---

## ITERATION TIPS

### How to Improve the Prompt

**If output is too generic:**
- Add more specific examples in System Instructions
- Example: "Write captions like: [barber example], [lash tech example]"

**If bot ignores niche differences:**
- Strengthen niche intelligence section
- Add more niche terminology examples

**If tone is off:**
- Adjust "TONE, STYLE & FORMATTING" section
- Provide 2-3 caption examples of what "correct" sounds like

**If gating doesn't work:**
- Clarify in PLAN-BASED BEHAVIOR section
- Make rules more explicit and testable

---

## TEST SUMMARY TEMPLATE

**Use this to track your overall testing:**

```
Litree Prompt Test Summary
Date: __________

FEATURE TESTS:
[ ] Onboarding Flow: ___/5
[ ] Daily Content: ___/5
[ ] 7-Day Pack: ___/5
[ ] Promo Engine: ___/5
[ ] DM Scripts: ___/5
[ ] Fraud Check: ___/5
[ ] Brand Voice: ___/5
[ ] Reactivation: ___/5

EDGE CASES:
[ ] Incomplete Profile: ___/5
[ ] Out of Scope: ___/5
[ ] Plan Gating: ___/5

OVERALL SCORE: ___/40 (converted to %)

TOP 3 ISSUES TO FIX:
1. _______________
2. _______________
3. _______________

READY FOR PRODUCTION? [ ] YES [ ] NO (if no, why? _____)
```

---

## NEXT STEPS

1. **Run all tests** using this guide
2. **Score each one** 1-5
3. **Note any issues**
4. **Iterate the prompt** based on failing tests
5. **Re-test** until all features score 4+ / 5
6. **Deploy** to your app once everything is 4+

---

**— Powered by Litree 🔥**


