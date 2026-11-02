# Trust Scout Signal Shield

Build a professional, modern, AI-powered cybersecurity web application called TRUST SHIELD.

Tagline: Detect. Verify. Protect.

Purpose:
Trust Shield is an all-in-one scam detection and misinformation verification platform designed for the UAE Hackathon in Sharjah. It helps users identify potential online scams, suspicious financial requests, phishing links, misleading news, and manipulated photos and videos.

I am a beginner with no coding experience. Build the website for me, including a functional frontend, backend, and database where necessary. Make the interface intuitive and suitable for a live hackathon demonstration.

1. Website design

Create a premium cybersecurity dashboard with:

Dark navy and black backgrounds

Emerald-green glowing accents

Modern shield logo

Professional animations

Clean cards and navigation

Mobile and desktop responsive design

English and Arabic language switching

UAE-inspired visual elements

Homepage heading: "Stop Scams. Verify the Truth. Stay Protected."

2. Scam detection features

Create separate scanner modules:

Link and URL Scanner

Detect suspicious URL structures and phishing patterns.

Check domain reputation using reputable external APIs when configured.

Display evidence and explain detected warning signs.

Website Verification

Check for suspicious domains and possible brand impersonation.

Analyze safely retrieved public website information.

Never automatically execute untrusted website code.

Phone Number Checker

Support UAE +971 and international numbers.

Validate number formats.

Check legitimate scam-report sources if integrations are available.

Do not claim that an unreported number is safe.

Bank Account Checker

Support UAE IBAN validation.

Analyze suspicious payment requests.

Mask sensitive bank details.

Never confuse a valid IBAN with proof that an account is trustworthy.

Message Scam Detector

Allow users to paste messages from WhatsApp, Instagram, Telegram, Facebook, TikTok, SMS, and email.

Detect impersonation, fake prizes, urgent payment requests, phishing attempts, and suspicious language.

Allow screenshots of messages to be uploaded and analyzed.

Prepare for optional automatic scanning through authorized platform integrations.

3. Fake news and media verification

Create a section called Media Verify.

Photo Verification

Allow users to upload images.

Look for signs of manipulation and AI-generated content.

Support metadata inspection and external source verification.

Video Verification

Allow video uploads.

Extract representative frames.

Investigate manipulation clues and misleading context.

News Verification

Allow users to paste headlines, news claims, and article links.

Compare claims with credible reporting and official sources when connected.

Investigate old footage presented as current events.

Explain what evidence supports or contradicts a claim.

Include a special focus on conflict-related misinformation and emergency rumors that may cause public panic.

Never claim that media is authentic or fake without sufficient evidence.

4. AI analysis results

Show:

Risk score from 0 to 10 with colors for each score 

Low, medium, or high risk category

Explanation of warning signs

Confidence or evidence-strength indicator

Supporting sources when available

Practical safety recommendations

Clear warnings when verification is inconclusive

5. Extra features

Scam awareness and educational tips

UAE-specific scam awareness section

User feedback and report submission

Sample test cases for hackathon demonstrations

Privacy-focused processing

No storage of sensitive scanned data without explicit consent

6. Technical implementation

Use React, TypeScript, Tailwind CSS, and suitable backend services.

Build a functional minimum viable product first.

Start with the homepage, navigation, message scanner, and URL scanner. Implement actual rule-based detection and validation logic, then add external security APIs and AI features incrementally.

Keep API keys server-side. Apply safe URL handling, file validation, upload limits, and secure data processing.

Do not create fake working API results or random risk scores. Clearly label any demo-only or unfinished features.

Create a professional website that is easy to demonstrate to hackathon judges.

Begin building Trust Shield now.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://trust-scout-signal-shield.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/38d00d5c-cb40-57a6-af1c-6388bc68a994).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
