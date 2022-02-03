import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

// import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";

import { followListInfoQuery, searchUserInfoQuery } from "../src/utils/query";
import {
  FollowListInfoResp,
  SearchUserInfoResp,
  Network,
} from "../src/utils/types";
import {
  formatAddress,
  removeDuplicate,
  isValidAddr,
} from "../src/utils/helper";

import { useThirdWeb } from "../src/context/thirdwebContext";

import { HeaderLink } from "../src/components/HeaderLink";
import LoadingButton from "@mui/lab/LoadingButton";
import Snackbar from "@mui/material/Snackbar";

const NAME_SPACE = "CyberConnect";
const NETWORK = Network.ETH;
const CYBERLABADDRESS = "0x148d59faf10b52063071eddf4aaf63a395f2d41c";

// const sdk = new ThirdwebSDK("rinkeby");
const Home = () => {
  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, error, provider } = useWeb3();

  const { sdk, whitelist, updateWhitelist, bundleDrop, cyberConnect, address } =
    useThirdWeb();
  console.log("👋 Address:", address);

  const [searchAddrInfo, setSearchAddrInfo] =
    useState<SearchUserInfoResp | null>(null);
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);

  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState<boolean>(false);
  const [snackbarText, setSnackbarText] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const fetchSearchAddrInfo = async () => {
    const resp = await searchUserInfoQuery({
      fromAddr: address,
      toAddr: CYBERLABADDRESS,
      namespace: NAME_SPACE,
      network: NETWORK,
    });
    console.log("resp:", resp);
    if (resp) {
      setSearchAddrInfo(resp);
    }
  };

  const handleFollow = async () => {
    if (!cyberConnect || !searchAddrInfo) {
      return;
    }

    setFollowLoading(true);

    // Execute connect if the current user is not following the search addrress.
    if (!searchAddrInfo.followStatus.isFollowing) {
      await cyberConnect.connect(CYBERLABADDRESS);

      // Overwrite the local status of isFollowing
      setSearchAddrInfo((prev) => {
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
      await cyberConnect.disconnect(CYBERLABADDRESS);

      setSearchAddrInfo((prev) => {
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

  // Add this little piece!
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h2>Fan Member Page</h2>
        <p>Congratulations on being a member</p>
      </div>
    );
  }

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

  const checkCanClaim = async () => {
    if (!bundleDrop) return;
    console.log("Check if you can claim");
    try {
      const result = await bundleDrop.canClaim("0", 1);

      console.log(result);
    } catch (e) {
      console.log(e);
    }
  };
  // Render mint nft screen.
  console.log("searchAddrInfo", searchAddrInfo);
  useEffect(() => {
    fetchSearchAddrInfo();
  }, [address]);

  return (
    <div className="bg-black h-screen">
      <HeaderLink />;
      <div className="flex flex-col h-5/6 justify-center items-center">
        <div className="flex items-center justify-center">
          <div className="relative w-96 h-96 border-2 mr-14">
            <Image src="/6.png" layout="fill" objectFit="contain" />
          </div>
          <div>
            <div className="flex flex-row items-center">
              <h1 className="text-white text-5xl font-semibold m-4">
                cyberlab.eth
              </h1>
              <LoadingButton
                onClick={handleFollow}
                disabled={searchLoading || !address}
                loading={followLoading}
                className="!bg-white pt-2 mt-2"
              >
                {!searchAddrInfo?.followStatus.isFollowing
                  ? "Follow"
                  : "Unfollow"}
              </LoadingButton>
            </div>

            <p className="text-white text-lg my-2 mx-4">
              Address: 0x148d59faf10b52063071eddf4aaf63a395f2d41c
            </p>
            <div className="text-blue-400 m-2 rounded-md p-2">
              {!hasClaimedNFT || !searchAddrInfo?.followStatus.isFollowing
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
    </div>
  );
};

export default Home;
