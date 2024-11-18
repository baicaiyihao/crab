// @ts-ignore

import { Transaction } from "@mysten/sui/transactions";
import { Button, Container } from "@radix-ui/themes";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariable } from "./networkConfig";

export function Withdraw() {
  const tx = new Transaction();
  const crabPackageId = useNetworkVariable("crabPackageId");
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  function Withdraw_coin() {
    tx.moveCall({
      typeArguments:["0x35f68d0404b0dd676561abf3049031616658b6fd33bb50d05f198a47ca112b6f::al17er_coin::AL17ER_COIN"],
      arguments: [
          tx.object("0x4c4e1d249b93e95118baba80cd769686c1bc37238e656bc094f0f38176f0bb3f"),
          tx.object("0x52dc5ca6ca054f5e496f61377a3d12ab429a43196116b0e04bdb0c03f17f857a"),
          tx.object("0x6"),
      ],
      target: `${crabPackageId}::demo::withdraw`,
    });

    signAndExecute({
      transaction: tx,
    });
  }

  return (
    <Container>
      <Button
        size="3"
        onClick={Withdraw_coin}
      >
        取出代币
      </Button>
    </Container>
  );
}

export default Withdraw;