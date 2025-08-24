# MEXAS Token - Test Suite

## Overview

This test suite provides comprehensive coverage for the MEXAS stablecoin contract, ensuring security, functionality, and upgrade safety. The tests follow industry best practices and are designed to catch regressions and security vulnerabilities.

## Test Structure

### Organization
Tests are numbered to enforce deterministic execution order and improve readability in reports. Each file focuses on a single domain.
```
test/
├── 01-initialization.test.ts
├── 02-transfers.test.ts
├── 03-blacklist.test.ts
├── 04-supply.test.ts
├── 05-pause.test.ts
├── 06-permit.test.ts
├── 07-ownership.test.ts
├── 08-upgrades.test.ts
├── 09-gas-optimization.test.ts
├── README.md
└── helpers/
    └── fixtures.ts
```

### Test Categories

The test suite is organized into logical categories for clarity. All tests are in the main `test/` directory with numbered prefixes for deterministic execution:

#### Core Functionality Tests
- **01-initialization.test.ts**: Contract deployment and initialization
- **02-transfers.test.ts**: ERC20 transfer functionality and compliance
- **03-blacklist.test.ts**: Blacklist system and asymmetric enforcement (see [Blacklist Behavior Summary](../README.md#blacklist-behavior-summary))
- **04-supply.test.ts**: Minting, burning, and supply management
- **05-pause.test.ts**: Emergency pause functionality
- **06-permit.test.ts**: ERC20Permit gasless approvals
- **07-ownership.test.ts**: Access control and ownership management

#### Advanced Feature Tests
- **08-upgrades.test.ts**: UUPS upgrade patterns, storage preservation, and upgrade safety
- **09-gas-optimization.test.ts**: Performance measurement and gas usage analysis

**Note:** All tests follow numbered naming for deterministic execution order and are located directly in the `test/` directory.

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

```

### Coverage
```bash
# Run with coverage (solidity-coverage)
npx hardhat coverage

# Run with gas reporting
npm test

# Run all tests with coverage
npm run coverage
```

### Notes
- Tests run on Hardhat network by default.
- Numbered files ensure stable ordering and reporting.

## Test Coverage

### Coverage Goals
- **Function Coverage**: Comprehensive (78 tests across 9 categories)
- **Line Coverage**: 95%+
- **Branch Coverage**: 90%+ (enforced by CI)

### Coverage Report
After running `npm run coverage`, view the detailed coverage report:
- **Terminal**: Summary in console output
- **HTML**: Open `coverage/index.html` in browser
- **LCOV**: Available for CI integration

## Test Quality Standards

### Code Quality
- All tests use TypeScript for type safety
- Consistent naming conventions and structure
- Comprehensive error message testing
- Proper use of fixtures and helpers

### Security Focus
- Access control validation for all restricted functions
- Blacklist behavior verification
- Pause state validation
- Upgrade safety checks

### Gas Optimization
- Gas usage measurement for critical operations
- Performance benchmarking
- Optimization validation

## Continuous Integration

### Pre-commit Checks
```bash
npm run lint:sol && npm run lint:ts
npm test
```

### Full CI Pipeline
```bash
npm ci
npm run compile
npm test
npm run coverage
```

## Test Data and Fixtures

### Standard Test Accounts
- `owner`: Contract owner with administrative privileges
- `user1`, `user2`, `user3`: Regular user accounts for testing various scenarios and interactions

### Test Amounts
- Standard amounts use 6 decimal places (matching token decimals)
- Large amounts test boundary conditions
- Zero amounts test ERC20 compliance

### Network Configuration
- Tests run on Hardhat's local network
- Network-specific tests use appropriate configurations
- Gas measurements use realistic gas prices

## Best Practices

### Test Writing Guidelines
1. **Descriptive Names**: Test names should clearly describe what is being tested
2. **Single Responsibility**: Each test should verify one specific behavior
3. **Proper Setup**: Use fixtures for consistent test state
4. **Clean Teardown**: Ensure tests don't affect each other
5. **Error Testing**: Test both success and failure cases
6. **Event Verification**: Verify all emitted events
7. **State Validation**: Check contract state after operations

### Security Testing
1. **Access Control**: Verify only authorized users can call restricted functions
2. **Input Validation**: Test boundary conditions and invalid inputs
3. **Reentrancy**: Ensure no reentrancy vulnerabilities
4. **Upgrade Safety**: Validate storage layout preservation
5. **Feature Logic**: Verify all contract features and business logic operate correctly

### Performance Testing
1. **Gas Measurement**: Track gas usage for optimization
2. **Scalability**: Test with large amounts and many operations
3. **Efficiency**: Ensure operations complete within reasonable limits

## Troubleshooting

### Common Issues
- **Timeout Errors**: Increase mocha timeout in hardhat.config.ts
- **Gas Limit**: Adjust gas limits for complex operations
- **Network Issues**: Ensure proper network configuration
- **Coverage Issues**: Check exclusion patterns in coverage config

### Debugging
- Use `console.log` for debugging (removed in production)
- Enable verbose logging with `--verbose` flag
- Check gas reports for performance issues
- Review coverage reports for missing tests

## Contributing

When adding new tests:
1. Follow the existing structure and naming conventions
2. Add appropriate test categories
3. Update this documentation
4. Ensure coverage goals are maintained
5. Run the full test suite before submitting

## References

- [Hardhat Testing Guide](https://hardhat.org/tutorial/testing-contracts)
- [OpenZeppelin Test Helpers](https://docs.openzeppelin.com/test-helpers/)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Solidity Coverage](https://github.com/sc-forks/solidity-coverage)
