# Asset Discount Feature Flow

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Asset Discount System                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│    Admin     │
└──────┬───────┘
       │
       │ 1. Configure Platform Fee & Asset Discounts
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Smart Contract Storage                      │
├─────────────────────────────────────────────────────────────────┤
│  • PlatformFeePercentage: 1000 bps (10%)                        │
│  • AssetDiscount(NEVO): 5000 bps (50% discount)                 │
│  • AssetDiscount(USDC): 0 bps (no discount)                     │
└─────────────────────────────────────────────────────────────────┘
       │
       │ 2. User Contributes
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Contribution Processing                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  Step 1: Get Base Fee                                            │
│  ─────────────────────                                           │
│  base_fee_bps = get_platform_fee_percentage()                   │
│  Result: 1000 bps (10%)                                          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Step 2: Get Asset Discount                                      │
│  ───────────────────────────                                     │
│  discount_bps = get_asset_discount(asset)                       │
│                                                                   │
│  If NEVO token: 5000 bps (50%)                                   │
│  If USDC token: 0 bps (0%)                                       │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Step 3: Calculate Effective Fee                                 │
│  ────────────────────────────────                                │
│  effective_fee_bps = base_fee_bps - (base_fee_bps * discount_bps / 10000) │
│                                                                   │
│  NEVO Example:                                                    │
│    = 1000 - (1000 * 5000 / 10000)                               │
│    = 1000 - 500                                                  │
│    = 500 bps (5%)                                                │
│                                                                   │
│  USDC Example:                                                    │
│    = 1000 - (1000 * 0 / 10000)                                  │
│    = 1000 - 0                                                    │
│    = 1000 bps (10%)                                              │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Step 4: Calculate Fee Amount                                    │
│  ─────────────────────────────                                   │
│  platform_fee = (amount * effective_fee_bps) / 10000            │
│  net_contribution = amount - platform_fee                        │
│                                                                   │
│  NEVO Example (1000 tokens):                                     │
│    platform_fee = (1000 * 500) / 10000 = 50 tokens              │
│    net_contribution = 1000 - 50 = 950 tokens                    │
│                                                                   │
│  USDC Example (1000 tokens):                                     │
│    platform_fee = (1000 * 1000) / 10000 = 100 tokens            │
│    net_contribution = 1000 - 100 = 900 tokens                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  Step 5: Execute Transfers                                       │
│  ──────────────────────────                                      │
│  1. Transfer full amount from user to contract                  │
│  2. Track platform_fee separately                                │
│  3. Credit net_contribution to pool metrics                      │
│  4. Emit contribution event                                      │
└──────────────────────────────────────────────────────────────────┘
```

## Comparison Table

| Asset | Base Fee | Discount | Effective Fee | Amount | Fee Charged | Net to Pool |
|-------|----------|----------|---------------|--------|-------------|-------------|
| NEVO  | 10%      | 50%      | 5%            | 1000   | 50          | 950         |
| USDC  | 10%      | 0%       | 10%           | 1000   | 100         | 900         |
| XLM   | 10%      | 25%      | 7.5%          | 1000   | 75          | 925         |

## Fee Calculation Formula

```
Effective Fee (bps) = Base Fee (bps) × (1 - Discount (bps) / 10000)

Fee Amount = Contribution Amount × Effective Fee (bps) / 10000

Net Contribution = Contribution Amount - Fee Amount
```

## Example Scenarios

### Scenario 1: NEVO Token with 50% Discount
```
User contributes: 1000 NEVO
Base platform fee: 10% (1000 bps)
NEVO discount: 50% (5000 bps)

Calculation:
  Effective fee = 1000 - (1000 × 5000 / 10000) = 500 bps (5%)
  Fee amount = 1000 × 500 / 10000 = 50 NEVO
  Net to pool = 1000 - 50 = 950 NEVO

Result: User saves 50 NEVO in fees!
```

### Scenario 2: Regular Token with No Discount
```
User contributes: 1000 USDC
Base platform fee: 10% (1000 bps)
USDC discount: 0% (0 bps)

Calculation:
  Effective fee = 1000 - (1000 × 0 / 10000) = 1000 bps (10%)
  Fee amount = 1000 × 1000 / 10000 = 100 USDC
  Net to pool = 1000 - 100 = 900 USDC

Result: Standard fee applies
```

### Scenario 3: 100% Discount (Free Contributions)
```
User contributes: 1000 SPECIAL
Base platform fee: 10% (1000 bps)
SPECIAL discount: 100% (10000 bps)

Calculation:
  Effective fee = 1000 - (1000 × 10000 / 10000) = 0 bps (0%)
  Fee amount = 1000 × 0 / 10000 = 0 SPECIAL
  Net to pool = 1000 - 0 = 1000 SPECIAL

Result: No fees charged!
```

## Admin Configuration

### Setting Platform Fee
```rust
// Set platform fee to 10%
client.set_platform_fee_percentage(&1000);
```

### Setting Asset Discounts
```rust
// NEVO token: 50% discount
client.set_asset_discount(&nevo_address, &5000);

// Premium token: 75% discount
client.set_asset_discount(&premium_address, &7500);

// Partner token: 25% discount
client.set_asset_discount(&partner_address, &2500);
```

## Benefits for Users

1. **Lower Fees**: Users who contribute with discounted assets pay less
2. **Incentivized Behavior**: Encourages holding and using platform tokens
3. **Transparent**: All calculations are on-chain and verifiable
4. **Fair**: Everyone using the same asset gets the same discount

## Benefits for Platform

1. **Token Utility**: Increases demand for platform token (NEVO)
2. **Flexible Pricing**: Can adjust fees and discounts dynamically
3. **Partnership Opportunities**: Can offer discounts to partner tokens
4. **Revenue Optimization**: Balance between user incentives and platform revenue
