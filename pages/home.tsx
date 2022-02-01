import { useEffect, useMemo, useState } from 'react';

// import thirdweb
import { useWeb3 } from '@3rdweb/hooks';
import { ThirdwebSDK } from '@3rdweb/sdk';

import { followListInfoQuery, searchUserInfoQuery } from '../src/utils/query';
import {
  FollowListInfoResp,
  SearchUserInfoResp,
  Network,
} from '../src/utils/types';
import {
  formatAddress,
  removeDuplicate,
  isValidAddr,
} from '../src/utils/helper';
import { useThirdWeb } from '../src/context/thirdwebContext';

const NAME_SPACE = 'CyberConnect';
const NETWORK = Network.ETH;

// const sdk = new ThirdwebSDK("rinkeby");
const Home = () => {
  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, error, provider } = useWeb3();
  console.log('👋 Address:', address);
  const WALLET_ADDRESS = address;

  const { sdk, whitelist, updateWhitelist, bundleDrop } = useThirdWeb();

  const [searchAddrInfo, setSearchAddrInfo] =
    useState<SearchUserInfoResp | null>(null);

  const fetchSearchAddrInfo = async (toAddr: string) => {
    const resp = await searchUserInfoQuery({
      fromAddr: address,
      toAddr,
      namespace: NAME_SPACE,
      network: NETWORK,
    });
    if (resp) {
      setSearchAddrInfo(resp);
    }
  };

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  // State variable for us to know if user has our NFT.
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);

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
      .balanceOf(address, '0')
      .then((balance) => {
        // If balance is greater than 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log('🌟 this user has a membership NFT!');
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error('failed to nft balance', error);
      });
  }, [address, bundleDrop]);

  // This is the case where the user hasn't connected their wallet
  // to your web app. Let them call connectWallet.
  if (!address) {
    return (
      <div className="landing">
        <h2>Welcome to {WALLET_ADDRESS} Fanclub</h2>
        <button onClick={() => connectWallet('injected')} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }

  // Add this little piece!
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h2>{WALLET_ADDRESS} Fan Member Page</h2>
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
      .claim('0', 1)
      .then(() => {
        // Set claim state.
        setHasClaimedNFT(true);
        // Show user their fancy new NFT!
        console.log(
          `🌊 Successfully Minted! Check it our on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address.toLowerCase()}/0`
        );
      })
      .catch((err) => {
        alert("You don't have permission to mint this NFT.");
        console.error('failed to claim', err);
      })
      .finally(() => {
        // Stop loading state.
        setIsClaiming(false);
      });
  };
  const hanndleAddWhitelist = async () => {
    if (whitelist.indexOf(address) !== -1) {
      console.log('already in whitelist');
      return;
    } else {
      updateWhitelist(address, true);
      console.log('Add {address} to whitelist');
    }
  };

  const checkCanClaim = async () => {
    if (!bundleDrop) return;
    console.log('123');
    try {
      const result = await bundleDrop.canClaim('0', 1);

      console.log(result);
    } catch (e) {
      console.log(e);
    }
  };
  // Render mint nft screen.
  return (
    <div className="mint-nft">
      <button onClick={checkCanClaim}>Check canClaim</button>
      <button onClick={hanndleAddWhitelist}>Add address to whitelist</button>
      <h1>Mint your free {WALLET_ADDRESS} Membership NFT</h1>
      <button disabled={isClaiming} onClick={() => mintNft()}>
        {isClaiming ? 'Minting...' : 'Mint your nft (FREE)'}
      </button>
    </div>
  );
};

export default Home;
