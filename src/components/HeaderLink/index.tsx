import Image from "next/image";
import { useRouter } from "next/router";
import { WalletConnectButton } from "../WalletConnectButton";

export const HeaderLink: React.FC = () => {
  const router = useRouter();
  return (
    <div className=" bg-black flex justify-around items-center h-20">
      <div className="relative w-96 h-24 cursor-pointer">
        <Image
          src="/2.png"
          layout="fill"
          objectFit="contain"
          onClick={() => {
            router.push("/");
          }}
        />
      </div>
      <WalletConnectButton />
    </div>
  );
};
HeaderLink.displayName = "HeaderLink";
