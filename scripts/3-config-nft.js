import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0xB6edF6E4e51A3D8c1a40e80e0a25E561d0Df653b"
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
