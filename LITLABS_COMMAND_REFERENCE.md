# 📚 Litree Command Reference

**Complete user-facing guide to all supported commands and features**

---

## TABLE OF CONTENTS

1. [All Supported Commands](#all-supported-commands)
2. [Command Details by Category](#command-details-by-category)
3. [How to Use (Step-by-Step)](#how-to-use-step-by-step)
4. [FAQ](#faq)

---

## ALL SUPPORTED COMMANDS

| Command | What It Does | For Which Plans |
|---------|-------------|-----------------|
| `/onboard` | Reset your profile | All |
| `/daily_post` | Generate 1 post + caption + hashtags | Basic+ |
| `/content_week` | 7-day content pack | Pro+ |
| `/promo` | Create a promo offer + copy | Basic+ |
| `/slowday_fix` | Promo specifically for slow days | Basic+ |
| `/dm_reply` | Reply to a client DM | All |
| `/fraud_check` | Check if a DM is a scam | All |
| `/bio` | Write or rewrite your social bio | Pro+ |
| `/brand` | Define or refine your brand voice | Pro+ |
| `/referrals` | Referral ideas + scripts | Pro+ |
| `/sales` | Close leads + handle objections | Pro+ |
| `/story_pack` | Story ideas for today | Basic+ |

---

## COMMAND DETAILS BY CATEGORY

### 🎯 FOUNDATIONAL COMMANDS

#### `/onboard`

**What it does:**
- Asks you 7 questions to create/reset your profile
- Stores your business info, niche, location, ideal clients, etc.
- **You only need to do this ONCE** (or if you want to reset)

**When to use:**
- First time using Litree
- Want to completely change your profile
- Update your business info (new city, new services, etc.)

**How to use:**
```
You: /onboard

Bot: [Asks 7 questions]

You: [Answer the questions]

Bot: Here's your profile...
```

**Example output:**
```
📋 YOUR Litree PROFILE

Name: Maya Singh
Business: Divine Nails NYC
Services: Gel manis, acrylic sets, nail art
City: New York, NY
Ideal Clients: Brides, event-goers, professionals
Price Range: $50-75
Slow Days: Monday, Tuesday
What you need help with: Everything (posts, DMs, promos)

Status: Profile saved! Ready to get content.
```

---

#### `/daily_post`

**What it does:**
- Generates 1 complete post package for TODAY
- Includes: idea, caption, hashtags, story prompt, CTA
- Personalizes to your niche + city + business

**When to use:**
- Every morning (or whenever you want fresh content)
- When you're stuck on what to post
- Need a quick content idea

**How to use:**
```
You: /daily_post

Bot: [Generates full post package]
```

**Example output:**
```
POST IDEA:
Show a close-up of intricate nail art design (video or reel, 15 seconds)

CAPTION:
This detail? That's what separates a $30 manicure from a $60 one. 
Art takes time. Skill takes time. Quality takes time.
You know where to find it. 📍NYC 💅

HASHTAGS:
#NailArt #NYCNails #PrecisionWork #BeautyDetails #ArtisticNails #ProNails #CustomDesign #Nails #BeautifulNails #ArtisticBusiness

STORY PROMPT:
"Show your close-up nail art + ask: 'Which design should I offer next?'"

CTA:
Book your custom nail appointment now. Link in bio.
```

---

#### `/content_week` (Pro+ only)

**What it does:**
- Generates 7 days of content at once
- Each day = post idea + caption + hashtags
- Themed mix (educational, promo, social proof, etc.)

**When to use:**
- Plan your whole week on Sunday
- Batch content creation
- Want consistency without daily thinking

**How to use:**
```
You: /content_week

Bot: [7-day breakdown]
```

**Example output (shortened):**
```
DAY 1 - BOOKING BOOST
POST IDEA: Show satisfied customer testimonial or before/after

CAPTION: [Custom caption for barber in Atlanta about fades]

HASHTAGS: #FadeKing #Atlanta #BarberLife ...

---

DAY 2 - LOYALTY HOOK
POST IDEA: Show loyal repeat customer

CAPTION: "Been with me for 3 years straight..."

HASHTAGS: #BarberLoyalty #CustomerAppreciation ...

[... Days 3-7 continue with different themes ...]
```

---

### 📢 PROMOTIONAL COMMANDS

#### `/promo`

**What it does:**
- Creates a one-time promotional offer
- Generates offer copy + caption + why it works
- Can be used anytime you want to boost bookings

**When to use:**
- Want to fill appointment slots
- Need a promotion idea
- Want to increase sales this week

**How to use:**
```
You: /promo

Bot: [Generates promotional package]
```

**Example output:**
```
OFFER:
Full lash set + free brow lamination = $140 (normally $180)
Valid this week only

CAPTION:
Full GLAM week? Lashes + brows BOTH handled for one price.
$140. This week. Full stop.
Let's go. 💚

STORY SCRIPT:
"Yo, full sets + free brow work? $140? Yeah. DM me."

WHY IT WORKS:
- Bundles 2 services into 1 offer (higher perceived value)
- Creates urgency (this week only)
- Targets both lash + brow clients
```

---

#### `/slowday_fix`

**What it does:**
- Creates a promo SPECIFICALLY for your slow day
- Personalizes to your niche + slow day preference
- Generates urgency + discount ideas

**When to use:**
- You have specific slow days (e.g., Mondays always suck)
- Want to turn dead time into money
- Need an aggressive "fill the slots" promo

**How to use:**
```
You: /slowday_fix

Bot: [Generates slow-day specific promo]
```

**Example output:**
```
YOUR SLOW DAY: Monday

OFFER:
Monday-only specials: 30% off any service

CAPTION:
Mondays hit different for me (not in a good way). 
So Monday special: 30% off EVERYTHING. 
Haircuts. Shapes. Designs. All of it.
Come save that money. 💰

CTA:
"Only valid Mondays. Don't sleep on this."
```

---

### 💬 MESSAGING COMMANDS

#### `/dm_reply`

**What it does:**
- You paste a DM you received
- Bot generates a professional + personalized reply
- Moves conversation toward booking
- Handles objections smoothly

**When to use:**
- Someone DMs you + you're not sure how to respond
- Want to match your brand voice in responses
- Need to handle price objections or common questions

**How to use:**
```
You: /dm_reply

[Paste the DM you received]

Bot: [Generates safe, professional reply]
```

**Example:**

**Your input:**
```
/dm_reply

I got this DM: "Hey! How much for a full set? I saw another place doing them for $40."
```

**Bot output:**
```
SAFE REPLY:

Hey babe! I get it—price shopping is real 💕

Here's the thing though: $40 sets usually fall out in 2 weeks + damage your natural nails.

Mine last 4-5 weeks BECAUSE I use premium products + proper removal.

So you're actually saving money long-term. Plus your nails stay healthy.

What if we did a trial set? I can do $110 this week to get you in and see the difference yourself.

When you free?
```

---

#### `/fraud_check`

**What it does:**
- You paste a suspicious DM
- Bot identifies red flags (scams, payment weirdness, time-wasters)
- Provides a SAFE response to send back
- Explains why it's sketchy (if it is)

**When to use:**
- Something feels off about a DM
- Large upfront payment request
- Weird payment methods (Western Union, wire, etc.)
- Vague communication
- Too-good-to-be-true offers

**How to use:**
```
You: /fraud_check

[Paste the suspicious DM]

Bot: [Explains red flags + provides safe response]
```

**Example:**

**Your input:**
```
/fraud_check

Got this: "I need 10 full lash sets ASAP. I'll pay $3000 Western Union upfront right now. Can you have them done by tomorrow?"
```

**Bot output:**
```
🚨 RED FLAGS DETECTED:

1. Western Union = untraceable money (you lose it if scammed)
2. Massive upfront payment = huge risk
3. Impossible timeline (10 sets overnight = low quality + burnout)
4. Vague client details = probably not real

RECOMMENDATION: DECLINE POLITELY

SAFE RESPONSE TO SEND:

"Thanks for reaching out! I appreciate the interest, but I do business a different way:

- Traceable payment (Venmo, PayPal, card)
- 50% deposit, 50% day-of
- 1-2 week advance booking minimum
- Quality over speed

If that works for you, let's chat! Otherwise, I'd recommend finding a rush vendor.

Thanks! 💕"
```

---

### 🎨 BRANDING & CONTENT STRATEGY COMMANDS

#### `/bio` (Pro+ only)

**What it does:**
- Writes 2-3 new Instagram/TikTok bios
- Each has a different vibe (professional, fun, community-focused, etc.)
- You pick which matches your brand

**When to use:**
- Your current bio is outdated
- Want to attract a specific type of client
- Need ideas for multiple platforms

**How to use:**
```
You: /bio

[Optionally: describe current bio or paste it]

Bot: [Generates 2-3 options]
```

**Example output:**
```
Here are 3 bio options for you (Maya, nail tech, NYC):

OPTION 1 - "The Professional"
Premium Nails | Bridal Specialist | NYC | Book: link in bio 💅

OPTION 2 - "The Cool Girl"
Your nail girl 💅✨ | Art happens here | DM for vibes

OPTION 3 - "The Community"
Divine Nails fam since 2019 🧡 Bookings open! Link in bio

[For each option, explains the vibe + best use case]
```

---

#### `/brand` (Pro+ only)

**What it does:**
- Helps you define your brand voice + personality
- Suggests 3 brand directions (luxury, fun, artistic, etc.)
- Creates content guidelines + tone examples
- Suggests hashtags + aesthetic for each option

**When to use:**
- You're not sure what vibe you want
- Want to be more intentional with branding
- Need guidance on how to sound + look

**How to use:**
```
You: /brand

[Describe your ideal client or current vibe]

Bot: [Suggests 3 brand directions with details]
```

**Example output:**
```
Based on your answers, here are 3 brand directions:

---

BRAND OPTION 1: "The Luxury Nail Guru"
- Tone: Professional, educational, high-end
- Content: Behind-the-scenes technique videos, nail care tips, luxury vibes
- Hashtags: #PremiumNails #NailArtistry #Luxury #CraftmanShip
- Visual Aesthetic: Clean, organized, gold/white tones

---

BRAND OPTION 2: "Your Girl Next Door"
- Tone: Fun, relatable, hype woman energy
- Content: Bloopers, funny client stories, casual tips, celebrations
- Hashtags: #NailGirlLife #FunNails #BeautyBestie
- Visual Aesthetic: Candid, colorful, lots of emojis, casual

---

[BRAND OPTION 3 continues...]

RECOMMENDATION:
Based on your answers, I think Brand 1 matches your vibe best.
Pick one + I'll help you align ALL your content to it.
```

---

### 🔄 ADVANCED COMMANDS (Pro+ only)

#### `/referrals`

**What it does:**
- Creates referral program ideas + scripts
- Generates referral codes (conceptually)
- Provides DM templates to ask for referrals
- Explains how to structure referral incentives

**When to use:**
- Want to grow via word-of-mouth
- Need referral messaging that doesn't feel needy
- Want ideas for referral incentives

**How to use:**
```
You: /referrals

Bot: [Generates referral program options + scripts]
```

---

#### `/sales` (Pro+ only)

**What it does:**
- Helps close leads who are on the fence
- Provides objection-handling scripts
- Creates urgency without being pushy
- Generates follow-up sequences

**When to use:**
- Someone's interested but not booking
- Need to handle common objections
- Want follow-up templates

**How to use:**
```
You: /sales

[Describe the objection or hesitation]

Bot: [Provides closing scripts + follow-up plan]
```

**Example:**

**Your input:**
```
/sales

Girl said: "I'm interested in lashes but I'm scared to try extensions"
```

**Bot output:**
```
OBJECTION: Fear of trying something new

CLOSING SCRIPT #1 (Reassurance):
"Total get it! Lash anxiety is real. Here's what happens:
- I do a consultation first (no pressure)
- You can see exactly what they'll look like before I apply
- Takes 2 hours, super relaxing
- If you hate them, I'll give you a full refund

Zero risk. You've got nothing to lose. When can you come in?"

CLOSING SCRIPT #2 (Social Proof):
"You know what? My last 5 first-time clients said the same thing.
Now they're booked 3 weeks out 😂
I'll show you their pics if you want—they're OBSESSED.

Let's get you that same glow-up. This Saturday?"

FOLLOW-UP SEQUENCE:
[Day 1: Closing attempt]
[Day 3: Social proof message + testimonial]
[Day 7: Final offer + urgency]
```

---

#### `/story_pack`

**What it does:**
- Generates 3-5 story ideas you can post TODAY
- Each story is a standalone idea (polls, questions, behind-the-scenes, etc.)
- Quick-fire content that's engaging + boosts engagement

**When to use:**
- Want to post stories but don't know what to say
- Need ideas for engaging story content
- Want to increase time followers spend on your profile

**How to use:**
```
You: /story_pack

Bot: [Generates 5 story ideas]
```

**Example output:**
```
5 STORY IDEAS FOR TODAY:

STORY 1 - Poll
"What's your guilty pleasure beauty treatment?"
Options: Nails | Lashes | Hair | All of it

STORY 2 - Question
"What's the first thing you notice about someone?"

STORY 3 - Behind-the-Scenes
Show yourself prepping for clients + say "Preparation mode 🔥"

STORY 4 - Testimonial
Re-share a positive DM you got from a client

STORY 5 - Quick Tip
"Pro tip: Use cuticle oil DAILY for healthier nails ✨"
```

---

## HOW TO USE (STEP-BY-STEP)

### First Time Ever Using Litree

**Step 1: Onboard**
```
You: /onboard
[Answer the 7 questions]
```

**Step 2: Generate Today's Post**
```
You: /daily_post
[Get your first post + caption]
```

**Step 3: Post It Somewhere**
- Copy the caption
- Post on Instagram, TikTok, or other platform
- Tag Litree in the caption (optional but appreciated!)

**Step 4: Reply to a DM**
```
You: /dm_reply
[Paste the DM you received]
[Bot generates reply]
```

**Step 5: Keep Going**
- Use `/daily_post` every day (or `/content_week` to batch)
- Use `/promo` when you need to fill slots
- Use `/dm_reply` for every client message

---

### Daily Workflow

**Morning (5 min):**
1. Open Litree
2. Type `/daily_post`
3. Copy caption to Instagram
4. Post

**Throughout Day:**
1. When you get a client DM, type `/dm_reply`
2. Paste the DM
3. Use bot's response (adjust if needed)

**Weekly (30 min):**
1. Type `/content_week` on Sunday
2. Get 7 days of posts
3. Plan your week

---

## FAQ

### Q: Do I have to use commands? Can I just chat normally?

**A:** Yes! Commands are shortcuts, but you can also:
- Type: "Can you write me a post about my new lash style?"
- Bot will understand and generate content
- Commands are just faster if you know them

---

### Q: What if I don't have all my info ready for /onboard?

**A:** No problem! You can:
- Tell the bot what you DO know: "I'm a lash tech in NYC"
- Bot will ask for missing info
- You can skip questions and come back to `/onboard` later

---

### Q: Can I use the bot without a Litree account?

**A:** Yes! The bot works without an account.
BUT: If you want your history saved + to upgrade your plan, you'll want to create an account at https://Litree.com

---

### Q: What's the difference between Basic and Pro plans?

**A:**

| Feature | Basic | Pro | Deluxe |
|---------|-------|-----|--------|
| Daily posts | ✅ | ✅ | ✅ |
| 7-day packs | ❌ | ✅ | ✅ |
| Brand strategy | ❌ | ✅ | ✅ |
| Promo engine | ✅ | ✅ | ✅ |
| DM scripts | ✅ | ✅ | ✅ |
| Fraud check | ✅ | ✅ | ✅ |
| Unlimited use | ⏱️ Limited | ✅ | ✅ |

---

### Q: Can I use bot responses directly or should I customize them?

**A:** Both! You can:
- **Use directly:** If it matches your vibe, just copy-paste
- **Customize:** Adjust names, specifics, or tone to match your brand

Most people customize slightly to sound more like themselves. That's perfect.

---

### Q: What if the bot generates something I don't like?

**A:** Ask it to redo it!

Example:
```
That caption was too generic. Make it sound more like a fun girl who just loves nails.
```

Bot will adjust. You can iterate until it's perfect.

---

### Q: Does the bot know about my past content?

**A:** If you have a Litree account + are logged in, yes!
Bot can see:
- Your profile info
- Your past generated content
- Your brand voice preferences

If you're not logged in, it's a fresh chat each time.

---

### Q: Can I export all my generated content?

**A:** Yes! In your Litree account dashboard, you can:
- View all generated content
- Export to CSV
- Download in bulk

---

### Q: Is there a limit to how many posts I can generate?

**A:** Depends on your plan:
- **Basic:** Limited daily usage
- **Pro:** Unlimited posts/packs
- **Deluxe:** Unlimited everything

Check your dashboard to see your usage.

---

### Q: Can I use bot content across multiple platforms?

**A:** Absolutely! You can:
- Use captions on Instagram, TikTok, Facebook, etc.
- Adapt the content format (longer for IG caption, shorter for TikTok)
- Customize for platform-specific culture

---

### Q: How do I contact Litree if I have issues?

**A:** Email: support@Litree.com
Or DM: @Litree_ai on Instagram

We're here to help! 💚

---

**— Powered by Litree 🔥**


