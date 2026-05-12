# @layers/amba-shared

Shared TypeScript types and constants consumed by the amba SDKs.

## Install

```bash
npm install @layers/amba-shared
```

## What's exported

The default entry point re-exports:

- Core types: `AppUser`, `Project`, `ApiKey`, `PushCampaign`, `Segment`,
  `RemoteConfig`, `ContentItem`, `StreakDefinition`, `UserEntitlement`,
  `EngagementEvent`, `AnalyticsOverview`, `ApiResponse<T>`, `ApiError`.
- Constants: `API_VERSION`, `DEFAULT_API_URL`, `CONSOLE_URL`,
  `INTEGRATION_PROVIDERS`, `KEY_PREFIX`, `SYSTEM_SEGMENTS`,
  `XP_PER_LEVEL`.
- Validators: `isValidProjectSlug`, `isValidIanaTimezone`,
  `isReservedCollectionName`, `isReservedBindingName`,
  `validateRateLimitConfig`.
- Domain type modules: gamification, social, economy, platform.

Subpath entries are available for direct imports:
`@layers/amba-shared/platform-types`, `/social-types`, `/economy-types`,
`/gamification-types`, `/referral-codes`,
`/reserved-collection-prefixes`.

## License

Apache-2.0
