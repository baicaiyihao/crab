import { Transaction } from "@mysten/sui/transactions";
import { Button, Container } from "@radix-ui/themes";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../networkConfig.ts";
import { mergeCoins } from "../utils/mergeCoinsHelper.ts"; // 引入合并功能

interface DepositProps {
    coinType: string;
    poolId: string; // 传入的池子 ID
    coinObjects: string[]; // 传入的代币 Object ID 列表
    demoNftId: string; // 传入的 DemoNFT ID
    transferRecordPoolId: string; // 传入 Transfer Record Pool ID
    extraParam: string; // 额外参数
}

export default function Deposit({
                            coinType,
                            poolId,
                            coinObjects,
                            demoNftId,
                            transferRecordPoolId,
                            extraParam,
                        }: DepositProps) {
    const {mutate: signAndExecute} = useSignAndExecuteTransaction();
    const crabPackageId = useNetworkVariable("crabPackageId");

    async function Deposit_coin() {
        try {
            const tx = new Transaction();

            // 合并代币对象
            mergeCoins(tx, coinObjects);

            // 调用 deposit 函数
            tx.moveCall({
                typeArguments: [coinType], // 动态代币类型
                arguments: [
                    tx.object(poolId), // 动态传入池子 ID
                    tx.object(coinObjects[0]), // 主代币对象（合并后的）
                    tx.object(transferRecordPoolId), // Transfer Record Pool ID
                    tx.object(demoNftId), // DemoNFT ID
                    tx.object(extraParam), // 额外参数
                ],
                target: `${crabPackageId}::demo::deposit`,
            });

            tx.setGasBudget(100000000); // 设置 Gas 预算

            // 执行交易
            const result = await signAndExecute({transaction: tx});
            console.log("Deposit transaction executed:", result);
        } catch (error) {
            console.error("Error executing deposit transaction:", error);
        }
    }

    return (
        <Container>
            <Button size="3" onClick={Deposit_coin}>
                回收代币
            </Button>
        </Container>
    );
}
