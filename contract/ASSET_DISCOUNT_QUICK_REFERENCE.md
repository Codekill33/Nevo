# Asset Discount Feature - Quick Reference

## For Administrators

### Set Platform Fee
```rust
// Set base platform fee to 10% (1000 basis points)
contract.set_platform_fee_percentage(&1000);
```

### Configure Asset Discounts
```rust
// NEVO token gets 50% discount
contract.set_asset_discount(&nevo_token_address, &5000);

// Partner token gets 25% discount
contract.set_asset_discount(&partner_token_address, &2500);

// Remove discount (set to 0)
contract.set_asset_discount(&some_token_address, &0);
```

### Query Current Settings
```rust
// Get current platform fee
let fee = contract.get_platform_fee_percentage(); // Returns basis points

// Get discount for specific asset
let discount = contract.get_asset_discount(&token_address); // Returns basis points
```

## For Users

### Making a Contribution
```rust
// Contribute to a pool with any supported asset
contract.contribute(
    &pool_id,
    &contributor_address,
    &asset_address,  // Use NEVO for discounted fees!
    &amount,
    &is_private
);
```

### Fee Calculation
The fee you pay depends on:
1. **Base Platform Fee** - Set by admin (e.g., 10%)
2. **Asset Discount** - Varies by token (e.g., NEVO = 50% off)

**Formula:**
```
Your Fee = Amount × Base Fee × (1 - Discount)
```

**Example:**
- Contribute: 1000 NEVO
- Base Fee: 10%
- NEVO Discount: 50%
- Your Fee: 1000 × 10% × (1 - 50%) = 50 NEVO
- Pool Gets: 950 NEVO

## Basis Points Conversion

| Percentage | Basis Points |
|------------|--------------|
| 0%         | 0            |
| 1%         | 100          |
| 5%         | 500          |
| 10%        | 1000         |
| 25%        | 2500         |
| 50%        | 5000         |
| 75%        | 7500         |
| 100%       | 10000        |

## Common Discount Strategies

### Strategy 1: Platform Token Incentive
```rust
// Encourage NEVO usage with significant discount
set_platform_fee_percentage(&1000);        // 10% base fee
set_asset_discount(&nevo_address, &5000);  // 50% discount for NEVO
// Result: NEVO users pay 5%, others pay 10%
```

### Strategy 2: Tiered Discounts
```rust
// Different discounts for different partners
set_platform_fee_percentage(&1000);           // 10% base fee
set_asset_discount(&nevo_address, &7500);     // 75% off (2.5% fee)
set_asset_discount(&partner1_address, &5000); // 50% off (5% fee)
set_asset_discount(&partner2_address, &2500); // 25% off (7.5% fee)
// Others pay full 10%
```

### Strategy 3: Promotional Period
```rust
// Temporarily waive fees for specific token
set_platform_fee_percentage(&1000);            // 10% base fee
set_asset_discount(&promo_token, &10000);      // 100% discount (0% fee)
// Later, reduce discount
set_asset_discount(&promo_token, &5000);       // 50% discount (5% fee)
```

## Error Handling

### Invalid Fee/Discount (> 100%)
```rust
// This will fail
contract.set_platform_fee_percentage(&10001); // Error: InvalidFee
contract.set_asset_discount(&token, &10001);  // Error: InvalidFee
```

### Unauthorized Access
```rust
// Only admin can set fees/discounts
// Non-admin calls will fail with: Unauthorized
```

## Events Emitted

### When Platform Fee is Set
```rust
Event: platform_fee_percentage_set
Topics: (symbol, admin_address)
Data: fee_bps
```

### When Asset Discount is Set
```rust
Event: asset_discount_set
Topics: (symbol, admin_address, asset_address)
Data: discount_bps
```

### When Contribution is Made
```rust
Event: contribution
Topics: (symbol, pool_id, contributor, asset)
Data: (net_amount, timestamp, is_private)
// Note: net_amount is after fee deduction
```

## Testing

### Run Asset Discount Tests
```bash
# Run all asset discount tests
cargo test --package contract asset_discount

# Run specific test
cargo test --package contract test_contribute_with_platform_fee_and_discount
```

### Test Coverage
- ✅ Setting and getting platform fee
- ✅ Setting and getting asset discounts
- ✅ Fee calculation with no discount
- ✅ Fee calculation with discount
- ✅ Comparing different assets
- ✅ Edge cases (0% fee, 100% discount)
- ✅ Invalid inputs (> 100%)

## Integration Checklist

- [ ] Deploy contract
- [ ] Initialize with admin address
- [ ] Set platform fee percentage
- [ ] Configure asset discounts for desired tokens
- [ ] Test contribution with discounted asset
- [ ] Test contribution with non-discounted asset
- [ ] Verify fee calculations
- [ ] Monitor events for configuration changes

## Best Practices

1. **Start Conservative**: Begin with lower discounts and adjust based on usage
2. **Monitor Impact**: Track contribution patterns by asset type
3. **Communicate Clearly**: Inform users about discount benefits
4. **Update Gradually**: Make fee changes incrementally to avoid user confusion
5. **Document Changes**: Log all fee/discount updates with rationale

## Support

For questions or issues:
1. Check test files: `contract/contract/test/asset_discount_test.rs`
2. Review implementation: `contract/contract/src/crowdfunding.rs`
3. See detailed docs: `contract/ASSET_DISCOUNT_IMPLEMENTATION.md`
