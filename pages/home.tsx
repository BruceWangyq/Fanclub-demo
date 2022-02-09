import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";

import { searchUserInfoQuery } from "../src/utils/query";
import { SearchUserInfoResp, Network } from "../src/utils/types";

import { useThirdWeb } from "../src/context/thirdwebContext";

import { HeaderLink } from "../src/components/HeaderLink";
import LoadingButton from "@mui/lab/LoadingButton";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const NAME_SPACE = "CyberConnect";
const NETWORK = Network.ETH;
const TARGETADDRESS = "0x8Ff7f00Fc3888387e7459785F73769999A65cd57";

// const sdk = new ThirdwebSDK("rinkeby");
const Home = () => {
  // Use the connectWallet hook thirdweb gives us.
  const { provider } = useWeb3();
  const { sdk, bundleDrop, cyberConnect, address } = useThirdWeb();

  const [targetAddrInfo, settargetAddrInfo] =
    useState<SearchUserInfoResp | null>(null);
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [snackbarText, setSnackbarText] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const fetchTargetAddrInfo = async () => {
    if (!address) {
      return;
    }
    const resp = await searchUserInfoQuery({
      fromAddr: address,
      toAddr: TARGETADDRESS,
      namespace: NAME_SPACE,
      network: NETWORK,
    });
    if (resp) {
      settargetAddrInfo(resp);
    }
  };

  const handleFollow = async () => {
    if (!cyberConnect || !targetAddrInfo) {
      return;
    }

    setFollowLoading(true);

    // Execute connect if the current user is not following the search addrress.
    if (!targetAddrInfo.followStatus.isFollowing) {
      await cyberConnect.connect(TARGETADDRESS);

      // Overwrite the local status of isFollowing
      settargetAddrInfo((prev) => {
        return !!prev
          ? {
              ...prev,
              followStatus: {
                ...prev.followStatus,
                isFollowing: true,
              },
            }
          : prev;
      });

      setSnackbarText("Follow Success!");
    } else {
      await cyberConnect.disconnect(TARGETADDRESS);

      settargetAddrInfo((prev) => {
        return !!prev
          ? {
              ...prev,
              followStatus: {
                ...prev.followStatus,
                isFollowing: false,
              },
            }
          : prev;
      });

      setSnackbarText("Unfollow Success!");
    }
    console.log(1);
    await fetch("http://localhost:5000", {
      method: "GET",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      referrerPolicy: "no-referrer",
      body: null,
    });
    console.log(2);
    setSnackbarOpen(true);
    setFollowLoading(false);
  };

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  // State variable for us to know if user has our NFT.

  // Another useEffect!
  useEffect(() => {
    if (signer && sdk) {
      sdk.setProviderOrSigner(signer);
    }
    // We pass the signer to the sdk, which enables us to interact with
    // our deployed contract!
  }, [signer, sdk]);

  useEffect(() => {
    // If they don't have an connected wallet, exit!
    if (!address || !bundleDrop) {
      return;
    }

    // Check if the user has the NFT by using bundleDropModule.balanceOf
    bundleDrop
      .balanceOf(address, "0")
      .then((balance) => {
        // If balance is greater than 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to nft balance", error);
      });
  }, [address, bundleDrop]);

  const mintNft = () => {
    setIsClaiming(true);
    if (!bundleDrop) {
      return;
    }
    console.log(bundleDrop);
    // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
    bundleDrop
      .claim("0", 1)
      .then(() => {
        // Set claim state.
        setHasClaimedNFT(true);
        // Show user their fancy new NFT!
        console.log(
          `🌊 Successfully Minted! Check it our on OpenSea: https://testnets.opensea.io/assets/${bundleDrop.address.toLowerCase()}/0`
        );
      })
      .catch((err) => {
        alert("You don't have permission to mint this NFT.");
        console.error("failed to claim", err);
      })
      .finally(() => {
        // Stop loading state.
        setIsClaiming(false);
      });
  };

  // Render mint nft screen.
  useEffect(() => {
    fetchTargetAddrInfo();
  }, [address]);

  return (
    <div className="bg-black h-screen">
      <HeaderLink />;
      <div className="flex flex-col h-5/6 justify-center items-center">
        <div className="flex items-center justify-center">
          <div className="relative w-96 h-96 border-2 mr-14">
            <Image src="/x-white.png" layout="fill" objectFit="contain" />
          </div>
          <div>
            <div className="flex flex-row items-center">
              <h1 className="text-white text-5xl font-semibold m-4">
                cyberlab.eth
              </h1>
              <LoadingButton
                onClick={handleFollow}
                disabled={!address}
                loading={followLoading}
                className="!bg-white pt-2 mt-2"
              >
                {!targetAddrInfo?.followStatus.isFollowing
                  ? "Follow"
                  : "Unfollow"}
              </LoadingButton>
            </div>

            <p className="text-white text-lg my-2 mx-4">
              Address: 0x8Ff7f00Fc3888387e7459785F73769999A65cd57
            </p>
            <div className="text-blue-400 m-2 rounded-md p-2">
              {!hasClaimedNFT && targetAddrInfo?.followStatus.isFollowing
                ? "Hey! You can mint the membership NFT!"
                : "Sorry! You are not eligable for the membership NFT!"}
            </div>
            <h1 className="text-white mx-4">
              Mint your free Membership NFT if you followed "cyberlab.eth"
            </h1>
            <button
              disabled={isClaiming}
              onClick={() => mintNft()}
              className="bg-white w-60 m-4 rounded-md p-2 hover:bg-gray-600 hover:300"
            >
              {isClaiming ? "Minting..." : "Mint your NFT (FREE)"}
            </button>
          </div>
        </div>
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <MuiAlert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarText}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default Home;
