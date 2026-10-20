# 🎬 Copy for 5 calendar posts: Store vs performance, Loïc reel, Peak season teaser, Processors, Checkout Builder (Oct 15)

Notion URL: https://app.notion.com/p/3fae983412b881478288e85a993fc075
Exported 2026-10-18

---

<callout icon="🎬" color="blue_bg">
	Kept on 16 Oct: only the two posts still at Copy in progress, "More processors ≠ more payment resilience" (post 4 here) and "Why checkout changes shouldn't wait for engineering" (post 5). Four distinct variations each, built from the Swipe File, the Voice of Customer database and Loïc's video (transcript below). Every variation names the swipe it borrows from, with a link. My pick is marked on each post. Nothing on the company calendar was edited.
</callout>
## Loïc's video, word for word
Taken from the burned-in captions of the 48-second clip (the Creative 2 file on the calendar card).
> So the difference between a platform like Shopify or Tagada is that Tagada is really intended for merchants who are focused on performance. We provide features that will specifically allow you to boost your sales performance, so increasing AOV, increasing LTV for those who do subscriptions. Shopify is great for brands that are just starting out, but a brand that is scaling will start to face constraints. It needs to be increasingly sovereign and to minimize its dependence on payment providers as much as possible. When you're on Shopify, for example if you do subscriptions, your tokens are locked within Shopify. You cannot access them if tomorrow Shopify blocks your account. You are completely stuck. If you are on Tagada, we make you sovereign over your tokens. You can switch to another payment processor at any time if you get blocked. That really makes Tagada a platform designed for much more expert or advanced merchants.
The last few seconds are an outtake ("that's Stefan who got his hand in the cookie jar"). Trim it, or keep it as a blooper at the end if the team likes that.
## Voice of Customer lines used
- "We grew too fast." from [@Ecomvikings](https://x.com/Ecomvikings/status/2090388429691404533) (account killed with a 0.01% dispute rate)
- "There's a 90% chance you'll get hit with a Shopify hold... turboscaling from \$2k/day to \$10k/day" from [@ecom_rickx](https://x.com/ecom_rickx/status/2092627950378041573)
- "A processor that dropped for four minutes at 2am" from the [Tagada team on Product Hunt](https://www.hunted.space/product/tagadapay)
- "The smart routing and decline retries actually work as promised, which is rare." from a [Product Hunt commenter](https://www.hunted.space/product/tagadapay)
---
## 4. More processors ≠ more payment resilience
LinkedIn · Single post with the Fallback Processors screenshot or a simple diagram · Pillar Product · [Open the calendar card](https://app.notion.com/p/3f8cbbce57df80ff984de27b1b84e19c)
> Brief: A common misconception: adding multiple processors does not automatically make a payment setup resilient. Start from the operator problem. Processor #2 only helps if the infrastructure knows when and how to route an eligible failed payment to it. Then connect to the current Tagada product with a real routing screen or diagram. Cover why it matters as volume grows, why a backup alone is not enough, how routing creates real redundancy, and what to think about before peak season. Professional, understandable for non-technical readers.
**V1. Call out the operator, then the mechanism** (pick)
Swipe: [Duolingo LinkedIn, "Product Managers: want some advice..." 10.2x](https://www.linkedin.com/feed/update/urn:li:activity:7441468792205094912/), which names a job title and teaches, and [Stripe's OpenRouter post, 4.7x](https://www.linkedin.com/feed/update/urn:li:activity:7495899832687984640/), which opens with the idea before the product.
```plain text
Ecommerce operators: a second payment processor only protects you if something in your setup knows when to use it.

Picture a payment failing on processor #1. If nothing is set up to try processor #2, the sale ends there, and processor #2 sat in your dashboard the whole time.

The resilience comes from the logic between your processors:

- Which failed payments get a second try. A card reported stolen should stay declined. A processor that times out is exactly what a backup is for.
- Where those payments go next, and how many times you try before you stop.

This matters more as volume grows. A processor that drops for four minutes at 2am costs you a sale or two on a quiet night. On Black Friday, four minutes is every checkout in that window.

The screenshot is the Fallback Processors panel in Tagada. One toggle turns fallback on, you set the maximum retries (2 here), and the queue decides which processor goes next.

Before peak season, ask your own setup one question: if processor #1 says no at 9am on Nov 27, what happens to that payment?
```
**V2. The spare tire**
Swipe: [Liquid Death, "official energy drink sponsor of parenting" 9.9x](https://www.instagram.com/p/DZFubbQyMa5/), an everyday picture that reframes the problem, and Taylor Holiday's simple-explainer approach from the voice guide.
```plain text
A spare tire in your garage won't help you on the highway.

A lot of stores treat their second payment processor the same way. It's connected and approved, sitting right there in the dashboard. And when processor #1 declines a payment at checkout, nothing sends it over.

Two processors become a real backup when there's routing between them. Your setup has to decide which failed payments deserve another try, then send them to the right processor without anyone stepping in.

Some declines should stay declined, like a card reported stolen. Others are what a backup exists for, like a processor that times out or goes down for a few minutes.

The bigger you get, the more this costs. At a few orders an hour, a short outage loses you a sale. At peak traffic it loses you every checkout in that window.

In Tagada this lives in one panel (screenshot): fallback switched on, a retry limit, and a queue of processors in the order they should be tried.

Running more than one processor? Worth checking before November: when #1 says no, does #2 ever actually hear about it?
```
**V3. Two stores on Black Friday**
Swipe: the SLAY structure from Lara Acosta (story, lesson, action, you) and [Shaan Puri's Lyft post, 7x](https://x.com/ShaanVP/status/2084672814158926185), where two plain numbers make the point.
```plain text
9:14am, Black Friday. A processor starts timing out.

Store A has two processors connected. Payments fail for [11] minutes until someone notices, logs in and switches traffic over by hand.

Store B has the same two processors and one rule: if #1 fails, retry on #2. Their shoppers never find out anything happened.

Both stores had a backup. Only one of them had a plan for using it.

That plan is what payment resilience actually is: deciding which failed payments get retried, where they go, and how many times. The number of processors you've connected is the easy part.

If you're heading into peak season with more than one processor, walk through it now. Pick a failed payment and follow where it goes.

In Tagada, that plan is the Fallback Processors panel in the screenshot.

What does your setup do with a failed payment today?
```
**V4. Four questions before peak**
Swipe: [Duolingo LinkedIn advice post, 10.2x](https://www.linkedin.com/feed/update/urn:li:activity:7441468792205094912/) and [Ramp, "Go ahead and steal the playbook, it's free" 3.6x](https://x.com/tryramp/status/2042073092277580170), giving the method away openly.
```plain text
If you run more than one payment processor, ask your setup four questions before Black Friday.

1. When a payment fails, does anything try it again on another processor, or does the sale just end?
2. Which declines get retried? Retrying a card reported stolen can count against you. Retrying a timeout can save the sale.
3. In what order are your processors tried, and who decided that order?
4. How many retries before it stops?

If the honest answer to the first one is "nothing happens," your second processor is a spare part. The resilience you think you have lives in the routing, and the routing isn't there yet.

Volume makes this urgent. The same gap that costs one sale on a quiet Tuesday costs a whole window of checkouts during peak traffic.

In Tagada, the answers to 1, 3 and 4 sit in one panel (screenshot): fallback on, a retry limit, and a processor queue.

Steal the list. Run it this week.
```
**Alternate hooks:** "Two processors connected, zero backup." · "Your backup processor can't save a payment it never sees."
**Confirm before posting:**
- Product wording: fallback toggle, max retries 2 and the queue come from the [help center, Activate Fallback Settings](https://help.tagada.io/en/articles/32-activate-fallback-settings). Product team to confirm the panel looks the same today and is not part of V3.
- The stolen card vs timeout line describes card network retry rules in general. Payments team to confirm it, and to say how Tagada decides which failed payments are eligible for a retry (V4 leaves question 2 out of the panel sentence until then).
- V3's 9:14am and \[11\] minutes are a scenario. Keep it framed as one or swap in a real incident.
- "Four minutes at 2am" echoes the Tagada team's own Product Hunt line.
- Describes a product capability, so set Sensitivity.
---
## 5. Why checkout changes shouldn't wait for engineering
X · Single post with a Checkout Builder screenshot or short demo · Pillar Product · [Open the calendar card](https://app.notion.com/p/3f8cbbce57df80abbb2bd1276156478c)
> Brief: Use a clean screenshot or short demo from the current Checkout Builder. Marketing teams can change campaigns and offers quickly, but checkout changes often become slower when they depend on engineering workflows. Show how giving operators more direct control over checkout reduces that gap. Professional and proof-oriented. Do not oversell or make unsupported speed claims.
The card's channel says X, but the brief mentions a LinkedIn angle. These are written for X, kept professional as asked. All four are under 280 characters.
**V1. Pain, then the product** (pick)
Swipe: [Mercury, "Your AI agent can now do your most hated finance tasks" 13.8x](https://x.com/mercury/status/2065453705973960945), pain first, feature second.
```plain text
Your marketing team can write a new offer in an afternoon.

Changing the checkout to match it usually goes into the engineering queue.

The Checkout Builder lets the person running the offer change the checkout too.
```
**V2. The ticket**
Swipe: [HubSpot, "Q2 revenue closes in two weeks..." 4.5x](https://x.com/HubSpot/status/2067004672183775309), a deadline plus a very specific pain.
```plain text
Ticket #4182: "Update checkout to match the BFCM offer."
Status: backlog.
Assignee: none yet.
Offer goes live: Friday.

The Checkout Builder puts that change in the hands of the person who wrote the offer, so it doesn't wait for a sprint.
```
**V3. Meetings vs sprints**
Swipe: [Shopify, "There's a new way to design stores on Shopify. Introducing Canvas" 4.3x](https://x.com/Shopify/status/2105659827514941948), benefit first and plain.
```plain text
Black Friday offers get decided in meetings. Checkout changes get scheduled in sprints.

That gap is where a lot of campaigns launch with last month's checkout.

The Checkout Builder closes it: operators edit the checkout themselves.
```
**V4. Let engineers do the hard stuff**
Swipe: [Scrub Daddy, "So many bottles to clean..." 23.2x](https://www.instagram.com/p/DdT9rooug0S/), deadpan about a real chore. It also pairs with the "Never ask tech to explain it" post.
```plain text
Your engineers shouldn't spend Black Friday week moving a trust badge 12 pixels to the left.

The Checkout Builder lets your marketing and ops team make checkout changes themselves, and your engineers get to work on the hard stuff.
```
**Alternate hooks:** "The offer is ready. The checkout is still in the backlog." · "Who on your team can change the checkout today?"
**Confirm before posting:**
- What the Checkout Builder lets a non-technical person change (layout, offers, trust badges). V4 assumes trust badge placement; swap the example for one the demo actually shows.
- None of the four promise a time or speed. Keep it that way unless the team has a measured number.
- Describes a product capability, so set Sensitivity.
