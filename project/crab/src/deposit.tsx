

import { Transaction } from "@mysten/sui/transactions";
import { Button, Container } from "@radix-ui/themes";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariable } from "./networkConfig";

export function Deposit() {
  const tx = new Transaction();
  const crabPackageId = useNetworkVariable("crabPackageId");
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  function Deposit_coin() {
    tx.moveCall({
      typeArguments:["0x35f68d0404b0dd676561abf3049031616658b6fd33bb50d05f198a47ca112b6f::al17er_coin::AL17ER_COIN"],
      arguments: [
          tx.object("0x4c4e1d249b93e95118baba80cd769686c1bc37238e656bc094f0f38176f0bb3f"),
          tx.object("0xab92e4a248b5254c7cac0e9decb3cb8993da152060bc058cfdc95ef4660c884b"),
          tx.object("0x42c6430ad9ae9c3bbeae8688ad393eb72c1cc912b1452434340eeb4d98dbe386"),
          tx.object("0x2e50c6edfd5986f83621506a6287ef8c48ed8d863e2584750f561efe0593f708"),
          tx.object("0x6"),
      ],
      target: `${crabPackageId}::demo::deposit`,
    });

    signAndExecute({
      transaction: tx,
    });
  }

  return (
    <Container>
      <Button
        size="3"
        onClick={Deposit_coin}
      >
        回收代币
      </Button>
    </Container>
  );
}

export default Deposit;