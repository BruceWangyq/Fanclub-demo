import "../styles/globals.css";
import type { AppProps } from "next/app";
import { StyledEngineProvider } from "@mui/material";

// Import ThirdWeb
import { ThirdwebWeb3Provider } from "@3rdweb/hooks";
import { Web3ContextProvider } from "../src/context/web3Context";
import { ThirdWebContextProvider } from "../src/context/thirdwebContext";

// Include what chains you wanna support.
// 4 = Rinkeby.
const supportedChainIds = [4];

// Include what type of wallet you want to support.
// In this case, we support Metamask which is an "injected wallet".
const connectors = {
  injected: {},
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StyledEngineProvider injectFirst>
      <ThirdwebWeb3Provider
        connectors={connectors}
        supportedChainIds={supportedChainIds}
      >
        <ThirdWebContextProvider>
          <Component {...pageProps} />
        </ThirdWebContextProvider>
      </ThirdwebWeb3Provider>
    </StyledEngineProvider>
  );
}

export default MyApp;
