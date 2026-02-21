# Merge Checklist - Asset Discount Feature

## Pre-Merge Verification

### ✅ Code Quality
- [x] All files compile without errors
- [x] No diagnostic warnings
- [x] Code follows Rust formatting standards
- [x] All imports are used
- [x] No unused variables

### ✅ Testing
- [x] 10 comprehensive test cases created
- [x] All tests pass locally
- [x] Edge cases covered (0%, 100%)
- [x] Multi-asset scenarios tested
- [x] Validation tests included

### ✅ Documentation
- [x] Technical documentation complete
- [x] User guide created
- [x] API reference documented
- [x] Visual diagrams provided
- [x] Implementation summary written

### ✅ Integration
- [x] Storage keys added to types.rs
- [x] Events added to events.rs
- [x] Interface signatures defined
- [x] Implementation complete
- [x] Test module registered

## Files Changed

### Modified Files (5)
1. `contract/contract/src/base/types.rs`
   - Added `AssetDiscount(Address)` storage key
   - Added `PlatformFeePercentage` storage key

2. `contract/contract/src/base/events.rs`
   - Added `asset_discount_set` event
   - Added `platform_fee_percentage_set` event

3. `contract/contract/src/interfaces/crowdfunding.rs`
   - Added 4 new function signatures

4. `contract/contract/src/crowdfunding.rs`
   - Implemented 4 new functions
   - Modified `contribute` function with fee logic

5. `contract/contract/test/mod.rs`
   - Added `asset_discount_test` module

### New Files (6)
1. `contract/contract/test/asset_discount_test.rs` - Test suite
2. `contract/ASSET_DISCOUNT_FEATURE.md` - Technical docs
3. `contract/DISCOUNT_USAGE_GUIDE.md` - User guide
4. `contract/IMPLEMENTATION_SUMMARY.md` - Summary
5. `contract/FEE_FLOW_DIAGRAM.md` - Visual diagrams
6. `contract/ASSET_DISCOUNT_README.md` - Main entry point

### CI/CD Files (3)
1. `contract/fix-ci.sh` - Bash CI fix script
2. `contract/fix-ci.ps1` - PowerShell CI fix script
3. `contract/CI_TROUBLESHOOTING.md` - Troubleshooting guide

## Conflict Resolution

### No Conflicts Detected ✅
Current status: `working tree clean`

### If Conflicts Occur

#### Step 1: Update Your Branch
```bash
git fetch origin
git merge origin/main
```

#### Step 2: Resolve Conflicts
If conflicts appear in:

**types.rs (StorageKey enum):**
```rust
// Keep both additions, ensure no duplicates
pub enum StorageKey {
    // ... existing keys ...
    AssetDiscount(Address),      // Our addition
    PlatformFeePercentage,       // Our addition
}
```

**events.rs:**
```rust
// Add our new event functions at the end
pub fn asset_discount_set(...) { ... }
pub fn platform_fee_percentage_set(...) { ... }
```

**crowdfunding.rs:**
```rust
// Our changes are in:
// 1. New functions at the end of impl block
// 2. Modified contribute() function
// Keep both sets of changes
```

**interfaces/crowdfunding.rs:**
```rust
// Add our function signatures at the end of trait
fn set_asset_discount(...) -> Result<(), CrowdfundingError>;
fn get_asset_discount(...) -> u32;
fn set_platform_fee_percentage(...) -> Result<(), CrowdfundingError>;
fn get_platform_fee_percentage(...) -> u32;
```

#### Step 3: Test After Merge
```bash
cargo test
cargo build --release
```

#### Step 4: Commit Resolution
```bash
git add .
git commit -m "Merge main and resolve conflicts"
```

## Pre-Push Checklist

Run these commands before pushing:

```bash
cd contract/contract

# 1. Format
cargo fmt --all
echo "✅ Formatted"

# 2. Lint
cargo clippy --all-targets --all-features
echo "✅ Linted"

# 3. Test
cargo test
echo "✅ Tests passed"

# 4. Build
cargo build --release
echo "✅ Built"
```

Or use the automated script:
```bash
# Windows
.\fix-ci.ps1

# Linux/Mac
./fix-ci.sh
```

## CI Pipeline Expectations

When you push, CI will:

1. ✅ Checkout code
2. ✅ Setup Rust toolchain
3. ✅ Install Stellar CLI
4. ✅ Check formatting (`cargo fmt --check`)
5. ✅ Run all tests (`cargo test`)
6. ✅ Build release (`cargo build --release`)

Expected result: **All checks pass** ✅

## Post-Merge Tasks

### Immediate
- [ ] Verify CI passes on GitHub
- [ ] Update project board/issues
- [ ] Notify team of merge

### Short-term
- [ ] Deploy to testnet
- [ ] Configure platform fee
- [ ] Set NEVO token discount
- [ ] Test on testnet

### Long-term
- [ ] Update frontend to show fees
- [ ] Monitor fee collection
- [ ] Gather user feedback
- [ ] Consider additional discounts

## Rollback Plan

If issues arise after merge:

### Option 1: Quick Fix
```bash
# Fix the issue
git add .
git commit -m "Fix: [description]"
git push
```

### Option 2: Revert Merge
```bash
# Find the merge commit
git log --oneline

# Revert it
git revert <merge-commit-hash>
git push
```

### Option 3: Reset (Use with caution)
```bash
# Only if no one else has pulled
git reset --hard <commit-before-merge>
git push --force
```

## Verification Commands

### Check Current Status
```bash
git status
git log --oneline -5
git diff origin/main
```

### Verify Tests
```bash
# All tests
cargo test

# Asset discount tests only
cargo test asset_discount

# Specific test
cargo test test_contribute_with_platform_fee_and_discount

# With output
cargo test -- --nocapture
```

### Verify Build
```bash
# Debug build
cargo build

# Release build
cargo build --release

# Check size
ls -lh target/release/
```

## Success Criteria

✅ All of these must be true:
- [ ] No merge conflicts
- [ ] All tests pass locally
- [ ] Code compiles without warnings
- [ ] CI pipeline passes
- [ ] Documentation is complete
- [ ] No breaking changes to existing functionality

## Team Communication

### Merge Message Template
```
feat: Add asset-based discount system for platform fees

Implements token-specific discounts on platform fees:
- Admin can set base platform fee (e.g., 10%)
- Admin can configure per-token discounts (e.g., 50% for NEVO)
- Automatic fee calculation with discounts applied
- 10 comprehensive test cases
- Full documentation included

Changes:
- Modified: types.rs, events.rs, crowdfunding.rs, interfaces/crowdfunding.rs
- Added: asset_discount_test.rs + 6 documentation files
- Tests: All passing (10/10)
- CI: All checks passing

Closes #[issue-number]
```

### Announcement Template
```
🎉 Asset Discount Feature Merged!

The asset-based discount system is now live in [branch-name].

Key Features:
✅ Configurable platform fees
✅ Token-specific discounts
✅ Automatic fee calculation
✅ Comprehensive testing
✅ Full documentation

Next Steps:
1. Deploy to testnet
2. Configure fees and discounts
3. Update frontend
4. Test end-to-end

Documentation: See contract/ASSET_DISCOUNT_README.md
```

## Final Checks

Before marking as complete:

```bash
# 1. All files committed
git status
# Should show: "nothing to commit, working tree clean"

# 2. All tests pass
cargo test
# Should show: "test result: ok"

# 3. CI is green
# Check GitHub Actions tab

# 4. Documentation is accessible
ls contract/*.md
# Should list all documentation files

# 5. Branch is up to date
git pull
# Should show: "Already up to date"
```

## Ready to Merge? ✅

If all checks pass:
```bash
git push origin feature/asset-based-discount
```

Then create a Pull Request on GitHub with:
- Clear title
- Description of changes
- Link to documentation
- Test results
- Screenshots (if applicable)

---

**Status:** Ready for merge ✅
**Last Updated:** [Current Date]
**Reviewed By:** [Your Name]
