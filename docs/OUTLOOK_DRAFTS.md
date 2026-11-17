# Outlook mail options

The default mail flow creates editable .eml drafts in the browser. It does not send messages. In **Mail wording**, load your original .eml template, then choose **Save wording**; the MIS keeps its subject, formatted body, CC, inline images, and attachments, including the questionnaire workbook. Checklist drafts personalize the company name. Reminder drafts quote the checklist and include threading headers so they stay in its thread. Set dates for the checklist and follow-ups, then create them in order. The **Personal signature** editor accepts rich paste with tables and images or loads the Outlook signature block from an .eml. Each analyst’s signature is saved in that analyst’s own MIS account.

Bulk mail applies one mail date per type to all selected cases and saves those dates in the MIS. EML files remain editable drafts and are not scheduled for delivery.

## Send through Classic Outlook

Choose **Classic Outlook script** to download a Windows script for the selected messages. Run it with Classic Outlook installed and configured. If Outlook has one sending account, the script uses it. If Outlook has multiple accounts, it asks for the exact sender email once and uses that account for every message.

The script includes O. P. Jain (opjain@infomerics.com) in CC unless the address is already present. It shows a confirmation with the message count before sending. It sends messages in order; messages with a selected date are queued for 10:00 on that date. Keep Outlook open and connected for scheduled messages. The completion dialog reports messages handed to Outlook and any messages that could not be submitted; failed messages are saved as drafts when possible.

Outlook or your organisation’s security policy may still show a programmatic-send warning. Follow that prompt according to your organisation’s policy; the script does not bypass it. The script runs locally and does not store Outlook credentials in the MIS.

## Optional Microsoft Graph integration

Graph is not implemented in this static GitHub Pages build. Direct browser-based sending through Graph would require an Entra app registration and organisation approval for delegated mail permissions. Never put a client secret in this repository or browser code.
