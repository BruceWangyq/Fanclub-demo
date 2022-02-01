import React, { useState, useEffect, useContext, useCallback } from 'react';
import { ethers } from 'ethers';
import { ThirdwebSDK, BundleDropModule } from '@3rdweb/sdk';

interface ThirdWebContextInterface {
  sdk: ThirdwebSDK | null;
  updateWhitelist: (address: string, follow: boolean) => void;
  whitelist: string[];
  bundleDrop: BundleDropModule | null;
}

export const ThirdWebContext = React.createContext<ThirdWebContextInterface>({
  sdk: null,
  updateWhitelist: () => undefined,
  whitelist: [],
  bundleDrop: null,
});

export const ThirdWebContextProvider: React.FC = ({ children }) => {
  const [sdk, setSdk] = useState<ThirdwebSDK | null>(null);
  const [bundleDrop, setBundleDrop] = useState<BundleDropModule | null>(null);

  const [whitelist, setWhitelist] = useState<string[]>([]);

  const initThirdWeb = useCallback(() => {
    // Some quick checks to make sure our .env is working.
    console.log(process.env.NEXT_PUBLIC_PRIVATE_KEY);
    if (
      !process.env.NEXT_PUBLIC_PRIVATE_KEY ||
      process.env.NEXT_PUBLIC_PRIVATE_KEY == ''
    ) {
      console.log('🛑 Private key not found.');
      return;
    }

    if (
      !process.env.NEXT_PUBLIC_ALCHEMY_API_URL ||
      process.env.NEXT_PUBLIC_ALCHEMY_API_URL == ''
    ) {
      console.log('🛑 Alchemy API URL not found.');
      return;
    }

    // if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS == "") {
    //   console.log("🛑 Wallet Address not found.");
    //   return;
    // }

    const sdk = new ThirdwebSDK(
      new ethers.Wallet(
        // Your wallet private key. ALWAYS KEEP THIS PRIVATE, DO NOT SHARE IT WITH ANYONE, add it to your .env file and do not commit that file to github!
        process.env.NEXT_PUBLIC_PRIVATE_KEY || '',
        // RPC URL, we'll use our Alchemy API URL from our .env file.
        ethers.getDefaultProvider(process.env.NEXT_PUBLIC_ALCHEMY_API_URL)
      )
    );

    const bundleDrop = sdk.getBundleDropModule(
      '0xfd1e14bA0aA9A5ff464c466cb84e6eA94693fDcD'
    );

    setBundleDrop(bundleDrop);
    console.log(bundleDrop);
    setSdk(sdk);
  }, []);

  const updateThirdWebWhitelist = useCallback(
    async (whitelist: string[]) => {
      if (!sdk || !bundleDrop) {
        return;
      }
      console.log(sdk);

      try {
        const factory = bundleDrop.getClaimConditionFactory();

        // Specify conditions.
        const claimPhase = factory.newClaimPhase({
          startTime: new Date(),
          maxQuantity: 10,
          maxQuantityPerTransaction: 1,
        });

        claimPhase.setSnapshot(whitelist);

        await bundleDrop.setClaimCondition(0, factory);
        console.log(
          '✅ Successfully set claim condition on bundle drop:',
          bundleDrop.address
        );
      } catch (error) {
        console.error('Failed to set claim condition', error);
      }
    },
    [sdk, bundleDrop]
  );

  const updateWhitelist = useCallback(
    (address: string, follow: boolean) => {
      let newList = [];
      if (!follow) {
        newList = whitelist.filter((item) => {
          return item !== address;
        });
      } else {
        newList = whitelist.concat([address]);
      }
      setWhitelist(newList);
      updateThirdWebWhitelist(newList);
    },
    [updateThirdWebWhitelist, whitelist]
  );

  useEffect(() => {
    initThirdWeb();
  }, [initThirdWeb]);

  return (
    <ThirdWebContext.Provider
      value={{
        sdk,
        updateWhitelist,
        whitelist,
        bundleDrop,
      }}
    >
      {children}
    </ThirdWebContext.Provider>
  );
};

export const useThirdWeb = () => {
  const thirdWeb = useContext(ThirdWebContext);
  return thirdWeb;
};
