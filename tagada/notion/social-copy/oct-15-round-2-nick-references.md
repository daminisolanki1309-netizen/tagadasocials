# 🧭 Round 2 from Nick's references: Store vs performance, Peak season teaser, Processors, Checkout Builder (Oct 15)

Notion URL: https://app.notion.com/p/3fae983412b881378eeee7ad4b7c556c
Exported 2026-10-18

---

<callout icon="🧭" color="blue_bg">
	Kept on 16 Oct: only posts 3 and 4, which are still at Copy in progress (posts 1 and 2 were removed because they're past the copy stage). Each has 4 variations in a different format taken from a different reference by Nick (newest first) or the Swipe File. The first round is on the page "Copy for 5 calendar posts" for comparison. The company calendar was not edited.
</callout>
## How Nick's references were used
<table header-row="true">
<tr>
<td>Nick's reference (date)</td>
<td>What it asks for</td>
<td>Used in</td>
</tr>
<tr>
<td>Eden call direction (Oct 15): Kashu vibe, AI done well or not at all, Kashu 4 product demo style, Reigne as the style the founders like, Commas best performers only</td>
<td>Less corporate, product shown working, nothing copied from partners</td>
<td>3 V3, 4 V3, 4 V4</td>
</tr>
<tr>
<td>Negative hook inspo (Oct 15)</td>
<td>Open by telling the reader what not to do or what won't work</td>
<td>3 V1, 4 V2</td>
</tr>
<tr>
<td>Reigne's post, less corporate and more futuristic (Oct 15)</td>
<td>Where ecommerce is heading, said like a person</td>
<td>4 V4</td>
</tr>
<tr>
<td>Simple ad concept, "free value" (Oct 9)</td>
<td>Give a useful tip first, product second</td>
<td>4 V1</td>
</tr>
<tr>
<td>Competitor and market watch (Oct 7 to 10): Dr Squash, "Easy post" on LinkedIn</td>
<td>Funny analogy that still teaches; short LinkedIn post that's easy to read</td>
<td>3 V2, 3 V4</td>
</tr>
</table>
---
## 3. More processors ≠ more payment resilience
LinkedIn · Single post with the Fallback Processors screenshot or a simple diagram
**V1. Negative hook** (pick)
Reference: Nick's negative hook inspo (Oct 15).
```plain text
A second payment processor won't save your Black Friday by itself.

It only helps if something in your setup knows when to send a failed payment there. Without that, processor #2 sits connected and approved in your dashboard while processor #1 declines your customers at 9am on Nov 27.

What turns two processors into a real backup:

1. A rule for which failed payments get another try. A timeout or an outage is worth retrying. A card reported stolen should stay declined.
2. An order the processors are tried in.
3. A limit on retries, so it knows when to stop.

The more you sell, the more the gap costs. A few minutes of failed payments on a quiet night is a sale or two. During peak traffic it's every checkout in that window.

In Tagada, this lives in one panel: Fallback Processors (screenshot). Switch it on, set the retry limit, order the queue.

Worth checking this week: when processor #1 says no, does your setup ever ask processor #2?
```
**V2. The second cashier**
Reference: Dr Squash from Nick's market watch (Oct 7 to 10), an everyday picture that makes the point and still teaches.
```plain text
Hiring a second cashier doesn't shorten the line if nobody sends customers to their register.

A lot of multi-processor setups work exactly like that. Two processors connected, both approved, and every payment still goes to the first one. When it declines or goes down, the sale ends there.

The second cashier only helps when someone directs the line. In payments that's routing: it sees a failed payment, checks whether it's worth another try, and sends it to the next processor in your queue.

This matters more as you grow. One stuck register on a slow Tuesday is annoying. On Black Friday morning it's the whole line walking out.

In Tagada, the Fallback Processors panel directs the line (screenshot): fallback on, a retry limit, and the order processors get tried in.

Before November, look at your own setup. Is anyone directing the line?
```
**V3. Product demo, step by step**
Reference: Kashu 4, the product demo style from the Eden call (Oct 15). The screenshot does the talking, the copy walks through it.
```plain text
What happens to a failed payment in Tagada, step by step (screenshot):

Step 1. A customer pays. Processor #1 declines or times out.
Step 2. Fallback is on, so the payment isn't dropped. Tagada checks whether it's worth another try.
Step 3. It goes to the next processor in your queue.
Step 4. It stops at the retry limit you set. Here that's 2.

The customer sees one checkout and one order confirmation.

Having two processors connected is step zero. The routing in steps 2 to 4 is what makes it a backup, and it's worth setting up before peak season, while traffic is still normal.

How does your setup handle step 2 today?
```
**V4. Easy post**
Reference: the "Easy post" on LinkedIn from Nick's market watch (Oct 7 to 10). Short, one idea, the screenshot underneath.
```plain text
Payment processors connected: 2.
Processors used when the first one fails: depends on your routing.

The count is the easy part. The rule between them is what saves the sale.

Check yours before Black Friday. Ours is in the screenshot.
```
**Confirm before posting:** product wording (fallback toggle, retry limit 2, queue) comes from the help center article "Activate Fallback Settings"; product team to confirm the panel still looks like that. Payments team to confirm the stolen card vs timeout line and how Tagada decides a payment is worth another try (V1, V3). Describes a product capability, so set Sensitivity.
---
## 4. Why checkout changes shouldn't wait for engineering
X · Single post with a Checkout Builder screenshot or short demo · No speed claims
**V1. Free value first** (pick)
Reference: Nick's simple ad concept, "free value" (Oct 9). Two tips people can use even without Tagada, then the product.
```plain text
Two checkout changes to make before Black Friday:

1. Show the BFCM offer on checkout too, so the deal people clicked is still there when they pay.
2. Put trust badges by the pay button, where people hesitate.

Marketing can make both in the Checkout Builder without a ticket.
```
**V2. Negative hook**
Reference: Nick's negative hook inspo (Oct 15).
```plain text
Stop opening tickets to change your checkout.

Your team writes the offer in a day. Then the checkout change waits in the engineering queue behind work that actually needs an engineer.

The Checkout Builder lets the person who wrote the offer update the checkout too.
```
**V3. Product demo** (pairs with a short screen recording)
Reference: Kashu 4, product demo style (Oct 15). The steps must match what the recording shows.
```plain text
Changing a checkout offer in Tagada, start to finish:

Open the Checkout Builder.
Pick the block.
Edit the offer.
Publish.

Nobody files a ticket, and your engineers stay on the roadmap.
```
**V4. Where it's heading**
Reference: Reigne's less corporate, more futuristic post (Oct 15).
```plain text
The brands that win the next few Black Fridays will treat checkout like their ads: something marketing can change.

Most can't yet. The ad ships today and the checkout ships next sprint.

The Checkout Builder hands checkout edits to the people running the campaign.
```
**Confirm before posting:** what a non-technical person can change in the Checkout Builder (offer blocks, trust badges). V1 and V3 assume both; swap the examples for what the demo shows. None of the four promise a time or speed. Describes a product capability, so set Sensitivity.
---
## Not used, and why
- Commas (direct competitor, Oct 15): they're partners, so nothing was borrowed from their posts. Worth a look once the best performers are picked.
- Higgsfield reel, Big E's feature reel, Amboras, UGC creator channel, "best of ads", text-on-video words: these are reel, UGC and ad formats, so they fit video posts better than these two cards.
- Kashu 3 ("AI done well or not at all"): neither post uses AI visuals, so it's a note for the designer.
