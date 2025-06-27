# System Settings & Configuration Module (`settings.md`)

## 1. Overview

The System Settings & Configuration module provides a centralized interface for administrators to manage various application-wide settings, branch-specific configurations, and integrations. This module ensures that the Church Management System can be tailored to the specific needs and operational workflows of different churches or branches.

## 2. Core Responsibilities

-   **Global Settings**: Managing application-wide configurations (e.g., default currency, date format, application name, global email sender).
-   **Branch-Specific Settings**: Allowing customization of settings at the individual branch level (e.g., branch-specific branding, local time zone, default fund for donations).
-   **Feature Toggles**: Enabling or disabling specific features or modules for the entire system or for particular branches.
-   **Integration Management**: Configuring integrations with third-party services (e.g., payment gateways, email providers, SMS gateways, mapping services).
-   **Custom Fields/Data**: Potentially allowing administrators to define custom fields for certain entities (e.g., custom fields for member profiles).
-   **Localization/Internationalization**: Managing language settings, translations, and regional formats.
-   **Security Settings**: Configuring password policies, session timeouts, multi-factor authentication (MFA) options.
-   **API Key Management**: Securely storing and managing API keys for external services.

## 3. Key Entities & Data Models

*(This module might not have many of its own primary entities but rather provides an interface to manage configuration values that could be stored in a key-value store, a dedicated configuration table, or environment variables. Some settings might be complex objects.)*

```typescript
// Example Placeholder Schema (conceptual)
// Settings might be stored as key-value pairs or structured JSON objects.

// For database storage, a simple model could be:
model SystemSetting {
  id          String    @id @default(cuid()) // or just use 'key' as id
  key         String    @unique // e.g., "global.appName", "branch.123.defaultTimeZone"
  value       Json      // Stores the setting value, can be string, number, boolean, object
  description String?
  isEditable  Boolean   @default(true) // Some settings might be system-managed
  scope       SettingScope // Enum: GLOBAL, BRANCH
  branchId    String?   // Null if scope is GLOBAL
  // branch   Branch?   @relation(fields: [branchId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum SettingScope {
  GLOBAL
  BRANCH
  USER // For user-specific preferences if managed here
}

// Example of structured settings (could be part of the 'value' Json)
interface PaymentGatewaySettings {
  provider: 'Stripe' | 'PayPal';
  apiKey: string;
  secretKey: string;
  webhookUrl: string;
}

interface EmailProviderSettings {
  provider: 'SendGrid' | 'AWS_SES';
  apiKey: string;
  defaultSenderEmail: string;
}
```

## 4. Core Functionalities & Use Cases

-   Super administrator sets the global application name and logo.
-   Branch administrator configures the default currency and time zone for their specific branch.
-   Admin enables/disables the "Online Giving" feature for a particular branch.
-   Staff enters API keys for integrating with a new SMS provider.
-   Defining custom fields to appear on the member registration form.

## 5. API Endpoints

*(Detail the relevant GraphQL mutations/queries or REST API endpoints here. These would typically be restricted to administrative roles.)*

### GraphQL (Example)

**Queries:**
-   `getSetting(key: String!, branchId: ID): SystemSetting`
-   `listSettings(scope: SettingScope, branchId: ID, keys: [String!]): [SystemSetting!]`
-   `getPaymentGatewayConfig(branchId: ID!): PaymentGatewaySettings` // Specific getter for typed settings

**Mutations:**
-   `updateSetting(key: String!, value: Json!, branchId: ID): SystemSetting`
-   `updateMultipleSettings(inputs: [UpdateSettingInput!]!): [SystemSetting!]`
-   `setPaymentGatewayConfig(branchId: ID!, config: PaymentGatewaySettingsInput!): Boolean`

## 6. Integration with Other Modules

-   **All Modules**: All other modules may read configuration values from this module to adapt their behavior (e.g., Finance module uses payment gateway settings, Communication module uses email provider settings).
-   **Branch Management**: Many settings are scoped at the branch level.
-   **Authentication & User Management**: For security settings like password policies, MFA.

## 7. Security Considerations

-   **Strict Access Control**: Only authorized administrators should have access to modify settings.
-   **Secure Storage of Sensitive Data**: API keys, passwords, and other sensitive configuration values must be encrypted at rest and in transit.
-   **Audit Logging**: Changes to settings should be logged for auditing purposes.
-   Validation of setting values to prevent misconfiguration.
-   Careful management of feature toggles to avoid unintended consequences.

## 8. Future Considerations

-   More granular role-based permissions for accessing specific settings.
-   Versioning of settings to allow rollback.
-   Environment-specific configurations (development, staging, production).
-   User interface for managing complex nested settings objects.
