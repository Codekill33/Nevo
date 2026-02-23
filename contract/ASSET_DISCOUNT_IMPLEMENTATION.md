# Asset Discount Feature Implementation

## Overview
The asset discount feature has been fully implemented to reward users who donate in specific tokens (e.g., NEVO token) with reduced platform fees.

## Implementation Details

### 1. Storage Keys
Added to `contract/contract/src/base/types.rs`:
- `AssetDiscount(Address)` - Maps asset addresses to their discount in basis points
- `PlatformFeePercentage` - Stores the base platform fee percentage

### 2. Core Functions
Implemented in `contract/contract/src/crowdfunding.rs`:

#### Admin Functions
- `set_asset_discount(env, asset, discount_bps)` - Sets discount for a specific asset (0-10000 bps)
- `get_asset_discount(env, asset)` - Retrieves discount for an asset (returns 0 if not set)
- `set_platform_fee_percentage(env, fee_bps)` - Sets base platform fee (0-10000 bps)
- `get_platform_fee_percentage(env)` - Retrieves base platform fee (returns 0 if not set)

#### Fee Calculation Logic
In the `contribute` function:
```rust
// Calculate platform fee with discount
let base_fee_bps = Self::get_platform_fee_percentage(env.clone());
let discount_bps = Self::get_asset_discount(env.clone(), asset.clone());

// Apply discount: effective_fee = base_fee * (1 - discount/10000)
let effective_fee_bps = if discount_bps > 0 {
    base_fee_bps.saturating_sub((base_fee_bps * discount_bps) / 10000)
} else {
    base_fee_bps
};

// Calculate fee amount: fee = amount * effective_fee_bps / 10000
let platform_fee = (amount * effective_fee_bps as i128) / 10000;
let net_contribution = amount - platform_fee;
```

### 3. Events
Added to `contract/contract/src/base/events.rs`:
- `asset_discount_set` - Emitted when an asset discount is configured
- `platform_fee_percentage_set` - Emitted when platform fee is updated

### 4. Interface
Added to `contract/contract/src/interfaces/crowdfunding.rs`:
```rust
fn set_asset_discount(env: Env, asset: Address, discount_bps: u32) -> Result<(), CrowdfundingError>;
fn get_asset_discount(env: Env, asset: Address) -> u32;
fn set_platform_fee_percentage(env: Env, fee_bps: u32) -> Result<(), CrowdfundingError>;
fn get_platform_fee_percentage(env: Env) -> u32;
```

## Test Coverage

### Test File: `contract/contract/test/asset_discount_test.rs`

#### 1. Basic Configuration Tests
- ✅ `test_set_platform_fee_percentage` - Verifies setting platform fee
- ✅ `test_set_platform_fee_percentage_invalid` - Validates fee cannot exceed 100%
- ✅ `test_set_asset_discount` - Verifies setting asset discount
- ✅ `test_set_asset_discount_invalid` - Validates discount cannot exceed 100%
- ✅ `test_get_asset_discount_default` - Confirms default discount is 0

#### 2. Fee Calculation Tests
- ✅ `test_contribute_with_platform_fee_no_discount` - Tests standard fee (5%)
  - Contribution: 1000 tokens
  - Fee: 50 tokens (5%)
  - Net: 950 tokens

- ✅ `test_contribute_with_platform_fee_and_discount` - Tests discounted fee
  - Base fee: 10% (1000 bps)
  - Discount: 50% (5000 bps)
  - Effective fee: 5% (500 bps)
  - Contribution: 1000 tokens
  - Fee: 50 tokens
  - Net: 950 tokens

- ✅ `test_contribute_with_different_assets_different_fees` - Compares two assets
  - NEVO token: 10% base with 50% discount = 5% effective (50 token fee)
  - Regular token: 10% base with 0% discount = 10% effective (100 token fee)

#### 3. Edge Case Tests
- ✅ `test_contribute_with_zero_platform_fee` - No fee when platform fee is 0%
- ✅ `test_contribute_with_100_percent_discount` - No fee with 100% discount

## Usage Example

### Setup
```rust
// Initialize contract
client.initialize(&admin, &token_address, &0);

// Set platform fee to 10%
client.set_platform_fee_percentage(&1000); // 1000 basis points = 10%

// Set 50% discount for NEVO token
client.set_asset_discount(&nevo_token_address, &5000); // 5000 basis points = 50%
```

### Contribution with Discount
```rust
// User contributes 1000 NEVO tokens
client.contribute(&pool_id, &contributor, &nevo_token_address, &1000, &false);

// Calculation:
// Base fee: 10%
// Discount: 50%
// Effective fee: 10% * (1 - 50%) = 5%
// Fee amount: 1000 * 5% = 50 tokens
// Net contribution: 1000 - 50 = 950 tokens
```

## Basis Points System
- 1 basis point (bps) = 0.01%
- 100 bps = 1%
- 1000 bps = 10%
- 10000 bps = 100%

## Security Features
1. **Admin-only access** - Only admin can set fees and discounts
2. **Validation** - Fees and discounts cannot exceed 100% (10000 bps)
3. **Safe math** - Uses `saturating_sub` to prevent underflow
4. **Event logging** - All configuration changes are logged

## Benefits
1. **Incentivizes specific tokens** - Encourages use of platform tokens (e.g., NEVO)
2. **Flexible configuration** - Admin can adjust fees and discounts dynamically
3. **Transparent** - All fee calculations are on-chain and verifiable
4. **Fair** - Different assets can have different fee structures

## Status
✅ **FULLY IMPLEMENTED AND TESTED**

All requirements have been met:
- ✅ Mapping of Asset -> Discount
- ✅ Fee calculation with discount applied
- ✅ Tests verify fee difference between normal and discounted assets
- ✅ Admin controls for configuration
- ✅ Event logging for transparency
