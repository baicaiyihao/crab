import { Transaction } from "@mysten/sui/transactions";
import {Button, Container} from "@radix-ui/themes";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { mergeCoins } from "../utils/mergeCoinsHelper.ts"; // 引入合并功能


interface NewPoolProps {
    crabPackageId: string;
    coinType: string;
    coinObjects: string[];
    poolTableId: string;
    transferRecordPoolId: string;
    demoNftId: string;
    extraParam: string;
}

export default function New_pool({
                             crabPackageId,
                             coinType,
                             coinObjects,
                             poolTableId,
                             transferRecordPoolId,
                             demoNftId,
                             extraParam,
                         }: NewPoolProps) {
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();

    async function executeNewPool() {
        if (!crabPackageId || coinObjects.length === 0) {
            console.error("Invalid input parameters for New_pool.");
            return;
        }

        try {
            const tx = new Transaction();

            // 合并代币对象（如果有多个）
            mergeCoins(tx, coinObjects);

            // 调用 new_pool 函数
            tx.moveCall({
                typeArguments: [coinType],
                arguments: [
                    tx.object(coinObjects[0]), // 主代币对象
                    tx.object(poolTableId), // PoolTable ID
                    tx.object(transferRecordPoolId), // TransferRecordPool ID
                    tx.object(demoNftId), // DemoNFT ID
                    tx.object(extraParam), // 额外参数
                ],
                target: `${crabPackageId}::demo::new_pool`,
            });

            tx.setGasBudget(100000000); // 设置 Gas 预算

            const result = await signAndExecute({ transaction: tx });
            console.log("New pool transaction successful:", result);
        } catch (error) {
            console.error("Error executing new_pool transaction:", error);
        }
    }

    return (
        <Container>
            <Button
                size="3"
                onClick={executeNewPool}
                style={{
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                Deposit
            </Button>
        </Container>
    );
}

