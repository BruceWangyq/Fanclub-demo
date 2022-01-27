import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0x9a4c13d336D85EF571E856803bb702BC108E12eD"
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Fanclub Membership NFT",
        description: "This NFT will give you access to the club!",
        image: readFileSync("scripts/assets/x.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();
