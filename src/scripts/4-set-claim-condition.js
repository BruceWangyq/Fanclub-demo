import sdk from './1-initialize-sdk.js';

const bundleDrop = sdk.getBundleDropModule(
  '0xfd1e14bA0aA9A5ff464c466cb84e6eA94693fDcD'
);

(async () => {
  try {
    const factory = bundleDrop.getClaimConditionFactory();

    // Specify conditions.
    const allowList = ['0x94a8b24d9129c104951B088E1f1Fe2249D5cA894'];
    const claimPhase = factory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 10,
      maxQuantityPerTransaction: 1,
    });

    claimPhase.setSnapshot(allowList);

    await bundleDrop.setClaimCondition('0', factory);
    console.log(
      '✅ Successfully set claim condition on bundle drop:',
      bundleDrop.address
    );
  } catch (error) {
    console.error('Failed to set claim condition', error);
  }
})();
