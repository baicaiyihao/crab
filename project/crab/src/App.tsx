import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Flex, Heading } from "@radix-ui/themes";

import CreateNFT from "./CreateNFT";
import New_pool from "./new_pool.tsx";
import Deposit from "./deposit.tsx";
import Withdraw from "./withdraw.tsx";
import Getuserinfo from "./Getuserinfo.tsx";

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
      <New_pool />
        <Deposit />
        <Withdraw />
    </>
  );
}

export default App;
