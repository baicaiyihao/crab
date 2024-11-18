

import { Transaction } from "@mysten/sui/transactions";
import { Button, Container } from "@radix-ui/themes";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariable } from "./networkConfig";

export function New_pool() {
  const tx = new Transaction();
  const crabPackageId = useNetworkVariable("crabPackageId");
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  function New_pool() {
    tx.moveCall({
      typeArguments:["0x35f68d0404b0dd676561abf3049031616658b6fd33bb50d05f198a47ca112b6f::al17er_coin::AL17ER_COIN"],
      arguments: [
          tx.object("0x2ea2d9c9fb2bfc457b898dfb71e9b71bb630ad3f3eef1e14bbde4b796d853bb5"),
          tx.object("0x01cf4eaf4590a1b4d83e14830bda715ac49df3bfc3e9d3b6e43707fb3f86a5b5"),
          tx.object("0x42c6430ad9ae9c3bbeae8688ad393eb72c1cc912b1452434340eeb4d98dbe386"),
          tx.object("0x2e50c6edfd5986f83621506a6287ef8c48ed8d863e2584750f561efe0593f708"),
          tx.object("0x6"),
      ],
      target: `${crabPackageId}::demo::new_pool`,
    });

    signAndExecute({
      transaction: tx,
    });
  }

  return (
    <Container>
      <Button
        size="3"
        onClick={New_pool}
      >
        创建coin pool
      </Button>
    </Container>
  );
}

export default New_pool;