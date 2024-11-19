import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Flex, Heading } from "@radix-ui/themes";


import Getuserinfo from "./Getuserinfo.tsx";
import Getcoininfo from "./Getcoininfo.tsx";
import GetTransferInfo from "./GetTransferInfo.tsx";

function App() {
    useCurrentAccount();
    return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading>dApp Starter Template</Heading>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
        <Getuserinfo />
        <Getcoininfo />
        <GetTransferInfo />
    </>
  );
}

export default App;
