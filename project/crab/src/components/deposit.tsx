import { Transaction } from "@mysten/sui/transactions";
import { Button, Container } from "@radix-ui/themes";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../config/networkConfig";
import { mergeCoins } from "../utils/mergeCoinsHelper";
import { handleSplitGas } from "../utils/splitCoinHelper";
import { TESTNET_GAS_AMOUNTS, TESTNET_GASPOOL } from "../config/constants";
import { useState } from "react";

interface DepositProps {
    coinType: string;
    poolId: string; // 传入的池子 ID
    coinObjects: string[]; // 传入的代币 Object ID 列表
    demoNftId: string; // 传入的 DemoNFT ID
    transferRecordPoolId: string; // 传入 Transfer Record Pool ID
    extraParam: string; // 额外参数
    onSuccess: () => void; // 成功回调函数
}

export default function Deposit({
                                    coinType,
                                    poolId,
                                    coinObjects,
                                    demoNftId,
                                    transferRecordPoolId,
                                    extraParam,
                                    onSuccess
                                }: DepositProps) {
    const { mutateAsync: signAndExecute, isError } = useSignAndExecuteTransaction();
    const crabPackageId = useNetworkVariable("crabPackageId");
    const currentAccount = useCurrentAccount();

    const [loading, setLoading] = useState(false);

    async function depositCoin() {
        if (!currentAccount?.address) {
            console.error("No connected account found.");
            return;
        }

        try {
            setLoading(true); // 设置加载状态

            const tx = new Transaction();
            tx.setGasBudget(100000000);

            // 处理 gas 分割
            const newCoin = await handleSplitGas(tx, currentAccount.address, TESTNET_GAS_AMOUNTS);
            if (!newCoin) {
                console.error("Failed to split gas.");
                return;
            }

            // 合并代币对象
            mergeCoins(tx, coinObjects);

            // 调用 deposit 函数
            tx.moveCall({
                typeArguments: [coinType], // 动态代币类型
                arguments: [
                    tx.object(coinObjects[0]), // 主代币对象（合并后的）
                    tx.object(poolId), // 动态传入池子 ID
                    tx.object(TESTNET_GASPOOL),
                    tx.object(newCoin),
                    tx.object(transferRecordPoolId), // Transfer Record Pool ID
                    tx.object(demoNftId), // DemoNFT ID
                    tx.object(extraParam), // 额外参数
                ],
                target: `${crabPackageId}::demo::deposit`,
            });

            // 执行交易并等待结果
            const result = await signAndExecute({ transaction: tx });
            console.log("Deposit transaction executed:", result);

            // 如果交易成功，调用回调函数
            if (result && !isError) {
                onSuccess(); // 调用成功的回调函数
            }
        } catch (error) {
            console.error("Error executing deposit transaction:", error);
        } finally {
            setLoading(false); // 重置加载状态
        }
    }

    return (
        <Container>
            <Button
                size="3"
                onClick={depositCoin}
                className="mark-as-scam-button"
                disabled={loading}
            >
                {loading ? 'Depositing...' : 'Deposit'}
            </Button>

        </Container>
    );
}