import sdk from './1-initialize-sdk.js';
import { readFileSync } from 'fs';

const bundleDrop = sdk.getBundleDropModule(
  '0xfd1e14bA0aA9A5ff464c466cb84e6eA94693fDcD'
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: 'Fanclub Membership NFT',
        description: 'This NFT will give you access to the club!',
        image: readFileSync('../assets/x.png'),
      },
    ]);
    console.log('✅ Successfully created a new NFT in the drop!');
  } catch (error) {
    console.error('failed to create the new NFT', error);
  }
})();
