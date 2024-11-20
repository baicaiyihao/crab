import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Flex, Heading, Container } from "@radix-ui/themes";


import Getuserinfo from "./pages/Getuserinfo.tsx";
import Getcoininfo from "./pages/Getcoininfo.tsx";
import GetTransferInfo from "./pages/GetTransferInfo.tsx";

export default function App() {
    const currentAccount = useCurrentAccount();
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
          <Heading>Crab</Heading>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>

      <Container>
        <Flex direction="column" align="center" my="4">
          <Box mb="4" width="100%">
            {/* 传递 currentAccount 作为参数 */}
            <Getuserinfo currentAccount={currentAccount} />
          </Box>
          <Box mb="4" width="100%">
            <Getcoininfo currentAccount={currentAccount} />
          </Box>
          <Box mb="4" width="100%">
            <GetTransferInfo currentAccount={currentAccount} />
          </Box>
        </Flex>
      </Container>
    </>
  );
}
