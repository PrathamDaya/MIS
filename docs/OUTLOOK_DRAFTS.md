# Outlook draft options

The default mail flow creates editable .eml drafts in the browser. It does not send messages. In **Mail wording**, load your original `.eml` template, then choose **Save wording**; the MIS keeps its subject, formatted body, CC, inline images, and attachments (including the questionnaire workbook). Checklist drafts personalize the company name. Reminder drafts quote the checklist and include Message-ID, In-Reply-To, and References headers so they stay in its thread. Set dates for the checklist and two follow-ups, then create them one at a time in order. The **Personal signature** editor accepts rich paste with tables and images or loads the Outlook `Signature` block from an `.eml`. It is saved in each analyst’s own MIS account and replaces the template’s signature block in generated mail.

Bulk mail applies one mail date per type to all selected cases and saves those dates in the MIS. EML drafts are not automatically scheduled for future delivery; use the classic Outlook script if you need Outlook's deferred-delivery setting.

The existing Windows script option creates drafts in classic Outlook. Review each draft and press Send yourself. A browser cannot place a message in Outlook's Drafts folder without a supported integration.

## Optional Microsoft Graph integration

Graph is documented as a future option and is not implemented or enabled in this static GitHub Pages build. Enabling it requires both code integration and an Entra app registration in the organisation's tenant; an administrator may need to approve delegated mail permissions. Never put a client secret in this repository or in browser code.

Setup steps for a future Graph integration:

1. In the Microsoft Entra admin center, create a single-tenant app registration for the MIS.
2. Add the production GitHub Pages URL as a Single-page application redirect URI.
3. Configure MSAL.js with the tenant ID, application ID, and exact redirect URI using a pinned, integrity-checked dependency.
4. Request only delegated User.Read and Mail.ReadWrite permissions; ask the organisation's administrator to approve them if required. Do not request Mail.Send for a drafts-only workflow.
5. After popup sign-in, create the checklist draft with POST /me/messages. Store its Graph message ID on the selected case after a successful response.
6. Create each reminder with POST /me/messages/{first-message-id}/createReply, then update the reply's body and save it as a draft. Keep the first message ID with the company so reminders reply to that same checklist thread.
7. Keep Graph draft creation behind an explicit Create Outlook drafts action. Do not send automatically. Continue to offer .eml downloads if sign-in is cancelled or Graph is unavailable.

Before enabling it, test the redirect URI, admin consent, draft creation, and reminder threading in a non-production mailbox. The .eml and classic Outlook options remain the available paths until the tenant setup and implementation are completed.
