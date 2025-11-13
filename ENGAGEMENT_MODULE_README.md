# Engagement Module (Notifications + Payments)

This README documents the end-to-end plan and implementation guide to unify Emails, SMS, and Payments into a single backend module called `engagement`.

- Module path: `chapelstack-backend/src/engagement/`
- Goals:
  - Consolidate notification channels (email, sms) behind a single dispatcher
  - Consolidate payments flows (Paystack now, extensible later) behind a gateway registry
  - Centralize settings, queues, logging, metrics, and security
  - Provide unified GraphQL APIs and deprecate legacy entry points gradually

---

## Architecture Overview

```
engagement/
  engagement.module.ts
  config/
    engagement.config.ts
  common/
    services/
      tenant-context.service.ts
      audit-log.service.ts
      metrics.service.ts
      rate-limit.service.ts
  notifications/
    notifications.facade.ts
    services/
      dispatcher.service.ts
      email.provider.ts
      sms.provider.ts
      template.service.ts
    queue/
      notifications.processor.ts
    resolvers/
      notifications.resolver.ts
  payments/
    payments.facade.ts
    services/
      gateway-registry.service.ts
      paystack.gateway.ts
      receipt.service.ts
      webhook.service.ts
      workflow.service.ts
    controllers/
      webhook.controller.ts
    resolvers/
      payments.resolver.ts
```

- Facades expose a stable API internally; domains consume facades, not providers.
- Providers wrap existing services (`communications/services/email.service.ts`, `sms.service.ts`, `subscriptions/services/paystack.service.ts`).
- A registry selects the payment gateway by organisation/branch settings.

---

## Phased Implementation

### Phase 1: Foundations (Low risk)
- Create `src/engagement` skeleton.
- Add facades + interfaces:
  - `INotificationDispatcher`, `ITemplateEngine`, notification DTOs
  - `IPaymentGateway`, payment DTOs (initiate, verify, refund, status)
- Wire `EngagementModule` into `src/app.module.ts`.
- Update domains to call facades (no behavior change):
  - `events/events.service.ts` → notification facade for confirmations
  - `broadcasts/services/broadcast-alert.service.ts` → notification facade
  - `subscriptions/events services` → payments facade for verification

### Phase 2: Provider Consolidation
- Email/SMS providers + settings under engagement config.
- Single `template.service.ts` for variables/partials.
- Unify queues into `notifications.processor.ts`; preserve legacy topics as aliases.
- Extract Paystack into `payments/paystack.gateway.ts`; add `gateway-registry.service.ts`.

### Phase 3: Unified GraphQL/API
- New resolvers:
  - `notifications.resolver.ts`: send, schedule, preview, stats
  - `payments.resolver.ts`: initiate, verify, refund, status
- Move/normalize webhooks to `engagement/payments/webhook.*`.
- Mark legacy resolvers as `@deprecated` in SDL with migration notes.

### Phase 4: Event-Driven Workflows
- Emit `PaymentVerified`, `PaymentRefunded` from payments workflow.
- Consume events in notifications dispatcher to send receipts.
- Decouple domain services from direct comms calls.

### Phase 5: Cleanup
- Remove legacy resolvers/services after deprecation period.
- Finalize docs and migration.

---

## File Changes (Checklist)

- Create:
  - `src/engagement/engagement.module.ts`
  - `src/engagement/config/engagement.config.ts`
  - `src/engagement/common/services/{tenant-context,audit-log,metrics,rate-limit}.service.ts`
  - `src/engagement/notifications/{notifications.facade.ts}`
  - `src/engagement/notifications/services/{dispatcher,email.provider,sms.provider,template}.service.ts`
  - `src/engagement/notifications/queue/notifications.processor.ts`
  - `src/engagement/notifications/resolvers/notifications.resolver.ts`
  - `src/engagement/payments/{payments.facade.ts}`
  - `src/engagement/payments/services/{gateway-registry,paystack.gateway,receipt,webhook,workflow}.service.ts`
  - `src/engagement/payments/controllers/webhook.controller.ts`
  - `src/engagement/payments/resolvers/payments.resolver.ts`
- Update:
  - `src/app.module.ts` → import `EngagementModule`
  - Domain call sites to use facades (events/broadcasts/subscriptions)
  - Legacy resolvers SDL with `@deprecated`

---

## GraphQL Schema Plan

- Notification types:
  - `NotificationChannel = EMAIL | SMS`
  - `SendNotificationInput { channel, recipients[], templateKey, variables, scheduleAt? }`
- Payment types:
  - `PaymentProvider = PAYSTACK`
  - `InitiatePaymentInput { amount, currency, reference, metadata }`

New resolvers:
- `engagementNotifications: sendNotification, previewTemplate, stats`
- `engagementPayments: initiate, verify, refund, getStatus`

Deprecations:
- Mark existing email/sms/payment mutations as `@deprecated` with migration notes.

---

## Security & Observability

- Enforce role-based guards equivalent to or stricter than legacy endpoints.
- Rate limit on send/verify/refund mutations.
- Centralized audit logs for sends/payments.
- Metrics: counters, latency histograms, error rates.

---

## Infra & Config

- Single config reader in `engagement/config/engagement.config.ts` for Email, SMS, Paystack (org/branch scoped).
- Standardize envs and document required keys.
- Re-register Paystack webhooks to new controller path; keep legacy forwarding during migration.

---

## Testing Strategy

- Unit tests: facades, registry, dispatcher routing, template rendering.
- Integration: webhook signature verification, unified send flows.
- E2E: subscription/event payments → verify → receipt email/SMS.

---

## Rollout Plan

- Feature flag to toggle new resolvers.
- Canary deploy and monitor metrics.
- Deprecate legacy endpoints after adoption; remove in a later release.

---

## Frontend Migration Notes

- Add new GraphQL docs/clients under `chapel-stack/src/graphql/{queries,mutations}/engagement*`.
- Migrate Settings pages to unified tabs (Email, SMS, Payments, Templates, Stats).
- Update UI flows (events, subscriptions) to call new resolvers; keep old ones as fallback under feature flag.
