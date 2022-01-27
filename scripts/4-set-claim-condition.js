import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule(
  "0x9a4c13d336D85EF571E856803bb702BC108E12eD"
);

(async () => {
  try {
    const factory = bundleDrop.getClaimConditionFactory();

    // Specify conditions.
    const allowList = [
      "0xB78d0Ba89a5a01F8FC09E896B841be05cc247393",
      "0x07C331E48d7767062D44C1F0a64566859AA265Fc",
      "0x5E0c9C286a993f82D7B5536f5EF6899d7F42dDA2",
    ];
    const claimPhase = factory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 10,
      maxQuantityPerTransaction: 1,
    });

    claimPhase.setSnapshot(allowList);

    await bundleDrop.setClaimCondition(0, factory);
    console.log(
      "✅ Successfully set claim condition on bundle drop:",
      bundleDrop.address
    );
  } catch (error) {
    console.error("Failed to set claim condition", error);
  }
})();
