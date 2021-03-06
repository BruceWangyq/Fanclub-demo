import { useState, useCallback } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { useThirdWeb } from "../../context/thirdwebContext";
import { formatAddress } from "../../utils/helper";
import { useRouter } from "next/router";

export const WalletConnectButton: React.FC = () => {
  const { connectWallet, address } = useThirdWeb();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const connect = useCallback(async () => {
    setLoading(true);
    await connectWallet();
    setLoading(false);
    router.push("/home");
  }, [connectWallet]);

  return (
    <div>
      {!address ? (
        <LoadingButton
          loading={loading}
          onClick={connect}
          className="bg-white text-black font-semibold rounded-2xl px-8 py-2 hover:translate-2 hover:bg-slate-400"
        >
          Connect Wallet
        </LoadingButton>
      ) : (
        <div className="text-white">Your Address: {formatAddress(address)}</div>
      )}
    </div>
  );
};

WalletConnectButton.displayName = "WalletConnectButton";
