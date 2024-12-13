import { Transaction } from "@mysten/sui/transactions";
import { Button, Container } from "@radix-ui/themes";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../config/networkConfig";
import { handleSplitGas } from "../utils/splitCoinHelper";
import { TESTNET_GAS_AMOUNTS, TESTNET_GASPOOL } from "../config/constants";
import { useState } from "react";

interface WithdrawProps {
    transferInRecordObject: string; // 转账记录对象 ID
    coinType: string; // 代币类型
    transferRecordPoolId: string; // Transfer Record Pool ID
    demoNftId: string; // 传入的 DemoNFT ID
    extraParam: string; // 额外参数
    onSuccess: () => void; // 成功回调函数
}

export function Withdraw({
                             transferInRecordObject,
                             coinType,
                             transferRecordPoolId,
                             demoNftId,
                             extraParam,
                             onSuccess,
                         }: WithdrawProps) {
    const { mutateAsync: signAndExecute, isError } = useSignAndExecuteTransaction();
    const crabPackageId = useNetworkVariable("crabPackageId");
    const currentAccount = useCurrentAccount();

    const [loading, setLoading] = useState(false);

    async function withdrawCoin() {
        if (!currentAccount?.address) {
            console.error("No connected account found.");
            return;
        }

        try {
            setLoading(true); // 设置加载状态

            const tx = new Transaction();
            tx.setGasBudget(10000000);

            // Handle gas splitting
            const newCoin = await handleSplitGas(tx, currentAccount.address, TESTNET_GAS_AMOUNTS);
            if (!newCoin) {
                console.error("Failed to split gas.");
                return;
            }

            // Call the withdrawal function
            tx.moveCall({
                typeArguments: [coinType], // Dynamically pass the coin type
                arguments: [
                    tx.object(transferRecordPoolId), // Transfer Record Pool
                    tx.object(TESTNET_GASPOOL), // Gas Pool
                    tx.object(newCoin), // New gas coin
                    tx.object(transferInRecordObject), // Transfer Record Object
                    tx.object(demoNftId), // DemoNFT ID
                    tx.object(extraParam), // Extra parameter
                ],
                target: `${crabPackageId}::demo::withdraw`,
            });

            // Execute the transaction and wait for the result
            const result = await signAndExecute({ transaction: tx });

            // If the transaction was successful, trigger the success callback
            if (result && !isError) {
                onSuccess(); // 调用成功的回调函数
            }
        } catch (error) {
            console.error("Error executing withdraw transaction:", error);
        } finally {
            setLoading(false); // 重置加载状态
        }
    }

    return (
        <Container>
            <Button
                size="3"
                onClick={withdrawCoin}
                className="mark-as-scam-button"
                disabled={loading}
            >
                Retrieve
            </Button>
        </Container>
    );
}

export default Withdraw;