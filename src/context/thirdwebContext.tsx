import React, { useState, useEffect, useContext, useCallback } from "react";
import { ethers } from "ethers";
import { ThirdwebSDK, BundleDropModule } from "@3rdweb/sdk";
import CyberConnect from "@cyberlab/cyberconnect";
import Web3Modal from "web3modal";

interface ThirdWebContextInterface {
  sdk: ThirdwebSDK | null;
  bundleDrop: BundleDropModule | null;
  connectWallet: () => Promise<void>;
  address: string;
  cyberConnect: CyberConnect | null;
}

export const ThirdWebContext = React.createContext<ThirdWebContextInterface>({
  sdk: null,
  bundleDrop: null,
  connectWallet: async () => undefined,
  address: "",
  cyberConnect: null,
});

export const ThirdWebContextProvider: React.FC = ({ children }) => {
  const [sdk, setSdk] = useState<ThirdwebSDK | null>(null);
  const [bundleDrop, setBundleDrop] = useState<BundleDropModule | null>(null);
  const [address, setAddress] = useState<string>("");
  const [cyberConnect, setCyberConnect] = useState<CyberConnect | null>(null);

  const initThirdWeb = useCallback(() => {
    // Some quick checks to make sure our .env is working.
    console.log(process.env.NEXT_PUBLIC_PRIVATE_KEY);
    if (
      !process.env.NEXT_PUBLIC_PRIVATE_KEY ||
      process.env.NEXT_PUBLIC_PRIVATE_KEY == ""
    ) {
      console.log("🛑 Private key not found.");
      return;
    }

    if (
      !process.env.NEXT_PUBLIC_ALCHEMY_API_URL ||
      process.env.NEXT_PUBLIC_ALCHEMY_API_URL == ""
    ) {
      console.log("🛑 Alchemy API URL not found.");
      return;
    }

    // if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS == "") {
    //   console.log("🛑 Wallet Address not found.");
    //   return;
    // }

    const sdk = new ThirdwebSDK(
      new ethers.Wallet(
        // Your wallet private key. ALWAYS KEEP THIS PRIVATE, DO NOT SHARE IT WITH ANYONE, add it to your .env file and do not commit that file to github!
        process.env.NEXT_PUBLIC_PRIVATE_KEY || "",
        // RPC URL, we'll use our Alchemy API URL from our .env file.
        ethers.getDefaultProvider(process.env.NEXT_PUBLIC_ALCHEMY_API_URL)
      )
    );

    const bundleDrop = sdk.getBundleDropModule(
      "0xfd1e14bA0aA9A5ff464c466cb84e6eA94693fDcD"
    );

    setBundleDrop(bundleDrop);
    console.log("bundleDrop:", bundleDrop);
    setSdk(sdk);
  }, []);

  const initCyberConnect = useCallback((provider: any) => {
    const cyberConnect = new CyberConnect({
      provider,
      namespace: "CyberConnect",
    });

    setCyberConnect(cyberConnect);
  }, []);

  const connectWallet = React.useCallback(async () => {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
      providerOptions: {},
    });

    const instance = await web3Modal.connect();

    const provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    setAddress(address);
    initCyberConnect(provider);
  }, [initCyberConnect]);

  useEffect(() => {
    initThirdWeb();
  }, [initThirdWeb]);

  return (
    <ThirdWebContext.Provider
      value={{
        sdk,
        bundleDrop,
        connectWallet,
        address,
        cyberConnect,
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
