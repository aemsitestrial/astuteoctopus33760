# XE Footer authoring: XE Footer vs. V2 vs. V4

**How each version is authored:**

- **XE Footer** uses free-form rich-text fields.
- **XE Footer V2** is a container: authors add items, one per link or column.
- **XE Footer V4** uses fixed slots on tabs in a single properties panel.

All three render the same Ignite footer, so they look the same. The differences are only in how authors build them.

---

## 1. Social Media Links

| | XE Footer | XE Footer V2 | XE Footer V4 |
|---|---|---|---|
| **How it's authored** | One rich-text field, **Social Media Links** | One **XE Footer Social Link** item per network | 5 fixed slots on the **Social Media** tab |
| **Fields** | Free-form links: icon images, `:facebook:`-style icons, or text | **Social Network** (dropdown) + **Social Link URL** | **Social Link N Network** (dropdown) + **Social Link N URL** |
| **How the network is identified** | Worked out from the link's URL, label, icon or text | Picked from the dropdown | Picked from the dropdown |
| **Limit** | None | 5. Extra items show "Only 5 social links are shown". The (+) menu stops offering the item | 5, because there are only 5 slots |
| **Nothing authored** | The live Xcel Energy social links render | Same | Same |

**Script:**

> "Let's start with social media links. In the original XE Footer, authors type social links into one rich-text field. It's flexible: an icon image, an icon code or plain text all work, and the footer works out the network from the link. But nothing guides the author and there's no limit.
>
> V2 makes each social link its own item. The author adds a Social Link, picks the network from a dropdown and pastes the profile URL. The footer allows five. Once you have five, the editor stops offering the option, and if a sixth gets in anyway, it's flagged in the editor and never published.
>
> V4 uses the same dropdown and URL pair, but as five fixed slots on a Social Media tab. There's nothing to add or remove; you fill in the slots you need, and empty ones are skipped.
>
> In all three versions, if no social links are entered, the footer shows Xcel Energy's standard profiles automatically, so it's never empty."

---

## 2. Legal Links

| | XE Footer | XE Footer V2 | XE Footer V4 |
|---|---|---|---|
| **How it's authored** | One rich-text field, **Legal Links** (a bulleted list) | One **XE Footer Legal Links** item holding a bulleted list | 3 fixed slots on the **Legal Links** tab |
| **Fields** | Free-form link list | **Legal Links** (rich text) | **Legal Link N URL** + **Legal Link N Text** |
| **Limit** | None | 1 item, though it can hold any number of links. A second item is flagged and the (+) menu stops offering it | 3 links |
| **Nothing authored** | The live defaults render: Online Terms of Use, Privacy, Accessibility | Same | Same |

**Script:**

> "Next, legal links: Privacy, Terms of Use, Accessibility. In XE Footer and V2, legal links are a simple bulleted list in a rich-text editor, so authors can list as many as they need. The difference is that V2 keeps the whole list in a single Legal Links item. A footer only gets one; once it exists, the editor stops offering another, which avoids duplicate legal sections.
>
> V4 is the most structured: three slots, each with a URL and a link text. It's the most predictable for authors and the hardest to break, but it caps the footer at three legal links.
>
> As with social links, an empty footer falls back to Xcel Energy's standard legal links."

---

## 3. Footer Column Links

| | XE Footer | XE Footer V2 | XE Footer V4 |
|---|---|---|---|
| **How it's authored** | One rich-text field, **Link Columns** | One **XE Footer Link Column** item per column | 5 fixed slots on the **Link Columns** tab |
| **Fields** | A heading paragraph followed by a bulleted list, repeated for each column | **Column Heading** + **Parent Page** | **Column N Heading** + **Column N Parent Page** |
| **Where the links come from** | Typed by hand | **Automatic**: the published pages directly under the parent page, sorted by title | **Automatic**, the same way |
| **Upkeep** | Every new page has to be added to the footer by hand | New pages appear once they're published | Same as V2 |
| **Limit** | None | 5 columns. Extras are flagged and the (+) menu stops offering the item | 5, because there are only 5 slots |
| **Edge cases** | A heading without links is ignored | Excludes deeper pages and pages marked `noindex`. A page with no published children shows a single link to itself | Same as V2 |

**Script:**

> "Finally, the biggest change: the footer columns. In the original XE Footer, authors write every column by hand in one rich-text field: a heading, then a bulleted list of links, then the next heading. It works, but every new page means someone has to remember to update the footer.
>
> V2 and V4 reverse that. Authors don't type links any more; they pick a parent page. The Company column points at the Company page, and the footer automatically lists every published page directly under it, sorted by title. Publish a new page under Company and it appears in the footer, with no footer edit needed. Unpublished, hidden (noindex) or deeply nested pages are left out.
>
> The difference between V2 and V4 is only the authoring style. V2 lets you add up to five column items in the editor and reorder them. V4 gives you five fixed heading-and-page slots on a tab.
>
> Columns built by hand in XE Footer still render exactly as before, so moving to the new approach can happen gradually."

---

## Closing line (optional)

> "To sum up: XE Footer is the most flexible but the most manual. V2 is item-based, with limits built into the editor. V4 is the most structured, with fixed slots on tabs. V2 and V4 both keep the footer's columns up to date automatically from the published site."

**For Q&A:** the automatic columns only list **published** pages, so a page that's only in preview won't show up yet.
