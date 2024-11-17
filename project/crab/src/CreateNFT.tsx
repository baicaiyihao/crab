import { Transaction } from "@mysten/sui/transactions";
import { Button, Container } from "@radix-ui/themes";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariable } from "./networkConfig";

export function CreateNFT() {
  const tx = new Transaction();
  const crabPackageId = useNetworkVariable("crabPackageId");
  const USERNFTTABLE = tx.object("0xb74d98e94afd976a9f7cf8a09c0734e653401d278d41142f46c7a862eea8a97a");
  const USERSTATE = tx.object("0xe0610afbe0eb63ddb93f7f2246fd17ed05e06bdddd0a2472e719e1120c20d50d");

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  function create() {
    tx.moveCall({
      arguments: [USERNFTTABLE, USERSTATE],
      target: `${crabPackageId}::demo::mint_user_nft`,
    });

    signAndExecute({
      transaction: tx,
    });
  }

  return (
    <Container>
      <Button
        size="3"
        onClick={create}
      >
        创建NFT
      </Button>
    </Container>
  );
}

export default CreateNFT;