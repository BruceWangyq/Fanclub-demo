import Image from "next/image";
import { WalletConnectButton } from "../WalletConnectButton";

export const HeaderLink: React.FC = () => {
  return (
    <div className=" bg-black flex justify-around mt-12 items-center h-20">
      <div className="relative w-96 h-24 cursor-pointer">
        <Image src="/2.png" layout="fill" objectFit="contain" />
      </div>
      <WalletConnectButton />
    </div>
  );
};
HeaderLink.displayName = "HeaderLink";
