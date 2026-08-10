# Intellistay AI Agent Readiness

## Current demo surfaces

- Guest mobile experience: the default Intellistay URL, with reservation/guest access, proactive arrival orchestration, concierge chat, tracked requests, billing, notifications, feedback, and participating-hotel switching.
- Hotel operations website: `?surface=operations`, with a responsive desktop command center, request actioning, proactive AI activity, policy controls, property switching, and MIS exports.
- Live demo synchronization: guest-created requests and hotel status changes synchronize between open guest and operations tabs through an in-browser demo channel. Demo data still resets on reload.

## Real AI compatibility

The frontend is compatible with a server-side OpenAI Responses API agent. The existing `VITE_CONCIERGE_API_URL` boundary sends hotel context, recent conversation, available services, interests, open tickets, and a compact action policy. No model credential belongs in the browser bundle.

Recommended production shape:

1. A server-side concierge orchestrator receives authenticated guest context and calls the Responses API.
2. Function tools expose only hotel-approved capabilities: availability checks, request drafts, PMS lookup, transport quotes, dining holds, billing retrieval, loyalty lookup, and notification scheduling.
3. The model may answer general questions without calling hotel tools. Out-of-scope questions never become operational tickets automatically.
4. External, costly, destructive, or irreversible actions require confirmation: charges, reservation cancellation, vehicle dispatch, refunds, room entry, and outbound email/SMS/WhatsApp.
5. Every tool call writes an audit event with guest consent state, source context, tool arguments, result, latency, cost, and final status.

Official references:

- Responses API and current model guidance: https://developers.openai.com/api/docs/guides/latest-model
- Function calling: https://developers.openai.com/api/docs/guides/function-calling

## Required production integrations

- Property management and reservations: OPERA Cloud or the participating hotel's PMS/CRS.
- Guest identity and consent: passwordless sign-in, reservation verification, device/session management, and role-based staff access.
- Operational tools: housekeeping, maintenance, front desk, concierge, dining/POS, loyalty, transport, and digital-key/IoT adapters.
- Event inputs: flight status, weather, arrival/check-in, room access, folio/payment, ticket SLA, and guest-preference events.
- Channels: APNs, Firebase Cloud Messaging, transactional email, SMS, and WhatsApp Business where approved.
- Durable platform: encrypted relational data, event queue, background jobs, webhooks, audit logs, observability, rate limits, and disaster recovery.

## Mobile-store path

The current mobile surface is a web prototype inside a device preview, not yet an App Store or Play Store binary. For a production mobile product, use a shared TypeScript domain layer with a dedicated native client. React Native with Expo is the recommended baseline because it supports iOS and Android push notifications, secure storage, deep links, biometrics, camera/location permissions, background tasks, and store builds while preserving a large part of the React skill set.

Before store submission, add:

- Native navigation and platform accessibility testing.
- APNs/FCM push delivery and permission education.
- Secure token/keychain storage and device revocation.
- Privacy disclosures, data deletion/export, consent history, and account recovery.
- Offline/error states, analytics consent, crash reporting, performance budgets, and store screenshots/metadata.
- TestFlight and Play closed-testing releases before production review.

## Recommended delivery sequence

1. Demo hardening: complete — scoped chat behavior, keyboard dismissal, mobile guest experience, desktop operations website, and live demo synchronization.
2. AI pilot: connect a server-side Responses API runtime with read-only PMS, weather, flight, and request-draft tools; add evals and audit logs.
3. Controlled actions: add approvals, idempotency, retries, compensation logic, and real notification channels.
4. Production web: durable data, staff authentication, role permissions, multi-property tenancy, monitoring, and security review.
5. Native mobile: React Native/Expo apps, native push, secure storage, accessibility QA, beta distribution, and store submission.

