module.exports = {
    skipFiles: [
      'mock',             // relative to contracts/
      'mock/',            // dir form
      'contracts/mock',   // safety
      'contracts/mock/',  // safety
    ],
    istanbulReporter: ['json', 'lcov', 'text-summary'],
    configureYulOptimizer: true,
  };
