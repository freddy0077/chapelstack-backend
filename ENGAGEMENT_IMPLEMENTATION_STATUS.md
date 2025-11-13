# Engagement Module Implementation Status

**Last Updated:** November 4, 2025  
**Current Phase:** Phase 2 (Provider Consolidation) - 60% Complete

---

## ✅ Completed (Phase 1 + Partial Phase 2)

### Module Foundation
- ✅ Created `src/engagement/` module structure
- ✅ Registered `EngagementModule` in `app.module.ts`
- ✅ Defined core interfaces:
  - `INotificationDispatcher`, `ITemplateEngine`, `SendNotificationInput`
  - `IPaymentGateway`, payment DTOs (initiate, verify, refund, status)

### Notifications (Unified)
- ✅ `NotificationsFacade` - stable entry point for domains
- ✅ `DispatcherService` - routes EMAIL/SMS to existing services
- ✅ `TemplateService` - basic variable interpolation ({{key}})
- ✅ `NotificationsResolver` - GraphQL mutation `sendNotification`
- ✅ Wired to existing `EmailService` and `SmsService`
- ✅ Support for `branchId`, `organisationId` scoping

### Payments (Unified)
- ✅ `PaymentsFacade` - stable entry point for domains
- ✅ `GatewayRegistryService` - selects gateway by provider
- ✅ `PaystackGateway` - wraps `subscriptions/services/PaystackService`
- ✅ `PaymentsResolver` - GraphQL mutations/queries:
  - `initiatePayment`, `verifyPayment`, `paymentStatus`
- ✅ Supports initiate, verify, getStatus (refund throws unsupported)

---

## 🚧 In Progress / Remaining Work

### Phase 2: Provider Consolidation (40% remaining)

#### Notifications - Enhanced Input Mapping
- ⏳ **Dispatcher improvements:**
  - Map `groupIds`, `filters`, `birthdayRange` from input to existing services
  - Support `templateId` lookup and rendering via `TemplateService`
  - Pass `branchId`/`organisationId` explicitly to email/sms services
  - Handle scheduling (`scheduleAt`) properly for both channels

#### Notifications - Additional Resolvers
- ⏳ **Add queries:**
  - `notificationStats(branchId, organisationId)` - counts, delivery rates
  - `previewTemplate(templateKey, variables)` - render preview without sending
  - `templates(branchId, organisationId)` - list available templates

#### Payments - Receipt/Workflow Service
- ⏳ **Create `payments/services/receipt.service.ts`:**
  - Send payment receipts via email/SMS after verification
  - Emit domain events (`PaymentVerified`, `PaymentRefunded`)

#### Queue Unification
- ⏳ **Create `notifications/queue/notifications.processor.ts`:**
  - Single processor routing by message type (email/sms)
  - Alias existing queues (`sms.queue`, `scheduled-sms.queue`) for backward compatibility
  - Standardize retry policies, telemetry

#### Config Consolidation
- ⏳ **Create `engagement/config/engagement.config.ts`:**
  - Centralize SMTP, SMS provider, Paystack keys
  - Support org/branch-scoped settings
  - Replace scattered reads from `settings/services/*-settings.service.ts`

---

### Phase 3: Unified GraphQL/API (Not Started)

#### Schema Deprecations
- ⏳ Mark legacy resolvers as `@deprecated`:
  - `communications/resolvers/email.resolver.ts`
  - `communications/resolvers/sms.resolver.ts`
  - `communications/resolvers/notification.resolver.ts`
  - Payment-specific mutations in `subscriptions/resolvers/*.ts`
- ⏳ Add migration notes in SDL descriptions

#### Webhook Consolidation
- ⏳ Move/normalize to `engagement/payments/webhook.service.ts`
- ⏳ Update `engagement/payments/controllers/webhook.controller.ts`
- ⏳ Keep legacy webhook path forwarding during transition

---

### Phase 4: Event-Driven Workflows (Not Started)

#### Domain Events
- ⏳ **Emit events from `payments/workflow.service.ts`:**
  - `PaymentVerified` → trigger receipt notifications
  - `PaymentRefunded` → trigger refund notifications
- ⏳ **Consume events in `notifications/dispatcher.service.ts`:**
  - Auto-send receipts on payment success
  - Decouple payment verification from direct email/SMS calls

#### Domain Migration
- ⏳ **Update call sites to use facades:**
  - `events/events.service.ts` → `NotificationsFacade` for registration confirmations
  - `broadcasts/services/broadcast-alert.service.ts` → `NotificationsFacade`
  - `subscriptions/services/subscriptions.service.ts` → `PaymentsFacade` for verification
  - `subscriptions/services/webhook.service.ts` → delegate to `engagement/payments/webhook.service.ts`

---

### Phase 5: Cleanup & Observability (Not Started)

#### Observability
- ⏳ **Add `common/services/audit-log.service.ts`:**
  - Log all sends/initiations/verifications (user, org, payload hash)
- ⏳ **Add `common/services/metrics.service.ts`:**
  - Emit counters/timers (send success, webhook latency, verification success)
- ⏳ **Add health checks:**
  - SMTP connectivity, SMS provider status, Paystack API reachability

#### Security
- ⏳ **Permissions & Guards:**
  - Apply role checks to new resolvers (equivalent or stricter than legacy)
- ⏳ **Rate limiting:**
  - Apply limits to `sendNotification`, `initiatePayment` endpoints
- ⏳ **Input validation:**
  - Add DTOs with class-validator decorators

#### Legacy Removal
- ⏳ Remove old resolvers/services after deprecation period (1-2 releases)
- ⏳ Update documentation and migration guide

---

## 📋 Frontend Work (Not Started)

### GraphQL Client Updates
- ⏳ Add `chapel-stack/src/graphql/mutations/engagementNotifications.ts`
- ⏳ Add `chapel-stack/src/graphql/mutations/engagementPayments.ts`
- ⏳ Add `chapel-stack/src/graphql/queries/engagementNotifications.ts`
- ⏳ Add `chapel-stack/src/graphql/queries/engagementPayments.ts`

### Settings UI
- ⏳ Add unified tabs under `Settings`:
  - Email Settings (SMTP config)
  - SMS Settings (provider config)
  - Payment Settings (Paystack keys)
  - Templates (notification templates)
  - Notification Stats

### Component Migration
- ⏳ Update UI components calling email/sms/payment mutations to new endpoints
- ⏳ Feature flags to toggle between old/new resolvers during rollout

---

## 🔧 Infrastructure & Config (Not Started)

### Environment Variables
- ⏳ Centralize secrets under `engagement/config/engagement.config.ts`
- ⏳ Document required env vars:
  - `SMTP_*`, `SMS_*`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`
- ⏳ Add to `.env.example`, `.env.prod`, `docker-compose.yml`

### Webhooks
- ⏳ Re-register or route Paystack webhooks to new controller path
- ⏳ Keep legacy path forwarding requests during transition

### Feature Flags
- ⏳ Add flags for gradual rollout:
  - `ENGAGEMENT_NOTIFICATIONS_ENABLED`
  - `ENGAGEMENT_PAYMENTS_ENABLED`

---

## 📊 Testing (Not Started)

### Unit Tests
- ⏳ Facades, gateway registry, dispatcher routing, template rendering

### Integration Tests
- ⏳ Paystack webhook signature verification
- ⏳ End-to-end send notification flows (email/sms)
- ⏳ Event-driven receipts after payment verification

### E2E Tests
- ⏳ Subscription payment → verification → receipt email/SMS
- ⏳ Event registration (paid/free) → notifications
- ⏳ Broadcast alerts → notification send

### Load Tests
- ⏳ Notification queue under realistic volume

---

## 📚 Documentation (Partially Complete)

### Completed
- ✅ `NOTIFICATIONS_AND_PAYMENTS_REFACTOR_ASSESSMENT.md` - assessment and plan
- ✅ `chapelstack-backend/ENGAGEMENT_MODULE_README.md` - architecture and phases

### Remaining
- ⏳ API documentation for new GraphQL endpoints
- ⏳ Migration guide for teams (old → new resolvers)
- ⏳ Update root `README.md` with engagement module overview
- ⏳ Runbook for webhook setup and troubleshooting

---

## 🎯 Priority Next Steps (Recommended Order)

1. **[HIGH] Improve dispatcher input mapping** (Phase 2)
   - Support `groupIds`, `filters`, `birthdayRange`, `templateId`
   - Ensure `branchId`/`organisationId` passed correctly

2. **[HIGH] Add notification queries** (Phase 2)
   - `notificationStats`, `previewTemplate`, `templates`

3. **[HIGH] Config consolidation** (Phase 2)
   - Create `engagement/config/engagement.config.ts`
   - Centralize SMTP/SMS/Paystack settings

4. **[MEDIUM] Queue unification** (Phase 2)
   - Create `notifications.processor.ts`
   - Alias legacy queues

5. **[MEDIUM] Domain migration** (Phase 4)
   - Update `events`, `broadcasts`, `subscriptions` to use facades

6. **[MEDIUM] Deprecate old resolvers** (Phase 3)
   - Add `@deprecated` annotations with migration notes

7. **[LOW] Observability** (Phase 5)
   - Audit logs, metrics, health checks

8. **[LOW] Frontend updates** (Post-backend)
   - New GraphQL clients, Settings UI tabs

---

## 📈 Overall Progress

- **Phase 1 (Foundations):** ✅ 100% Complete
- **Phase 2 (Provider Consolidation):** 🚧 60% Complete
- **Phase 3 (Unified GraphQL/API):** ⏳ 0% Complete
- **Phase 4 (Event-Driven Workflows):** ⏳ 0% Complete
- **Phase 5 (Cleanup & Observability):** ⏳ 0% Complete

**Total Implementation:** ~30% Complete

---

## 🚀 Immediate Action Items

To continue from where we are now:

1. **Enhance `DispatcherService`:**
   - Map `groupIds`, `filters`, `birthdayRange` to existing email/sms inputs
   - Support template lookup and rendering

2. **Add notification queries to resolver:**
   - `notificationStats`, `previewTemplate`, `templates`

3. **Create config service:**
   - `engagement/config/engagement.config.ts`

4. **Test current implementation:**
   - Try `sendNotification` mutation in GraphQL Playground
   - Try `initiatePayment` and `verifyPayment` mutations

5. **Document usage:**
   - Add examples to README
   - Create migration guide draft

---

## Notes

- Current implementation is **compile-safe** and **non-breaking** (facades delegate to existing services).
- Legacy resolvers remain functional; new resolvers are additive.
- Gradual migration path allows testing in production without risk.
- All new code follows existing patterns (NestJS modules, Prisma, GraphQL).

---

**For questions or to proceed with next steps, refer to:**
- `NOTIFICATIONS_AND_PAYMENTS_REFACTOR_ASSESSMENT.md` - detailed plan
- `chapelstack-backend/ENGAGEMENT_MODULE_README.md` - architecture guide
