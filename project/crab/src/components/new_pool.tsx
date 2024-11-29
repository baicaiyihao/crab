import { Transaction } from "@mysten/sui/transactions";
import {Button, Container} from "@radix-ui/themes";
import {useCurrentAccount, useSignAndExecuteTransaction} from "@mysten/dapp-kit";
import { mergeCoins } from "../utils/mergeCoinsHelper";
import {handleSplitGas} from "../utils/splitCoinHelper";
import {TESTNET_GAS_AMOUNTS, TESTNET_GASPOOL} from "../config/constants";
import {useState} from "react"; // 引入合并功能


interface NewPoolProps {
    crabPackageId: string;
    coinType: string;
    coinObjects: string[];
    poolTableId: string;
    transferRecordPoolId: string;
    demoNftId: string;
    extraParam: string;
    onSuccess: () => void; // 成功回调函数
}

export default function New_pool({
                             crabPackageId,
                             coinType,
                             coinObjects,
                             poolTableId,
                             transferRecordPoolId,
                             demoNftId,
                             extraParam,
                             onSuccess
                         }: NewPoolProps) {
    const { mutateAsync: signAndExecute, isError } = useSignAndExecuteTransaction();
    const currentAccount = useCurrentAccount();

    const [loading, setLoading] = useState(false);

    async function executeNewPool() {
        if (!crabPackageId || coinObjects.length === 0) {
            console.error("Invalid input parameters for New_pool.");
            return;
        }
        if (!currentAccount?.address) {
            console.error("No connected account found.");
            return;
        }


        try {
            setLoading(true); // 设置加载状态
            const tx = new Transaction();
            tx.setGasBudget(100000000);
            const newCoin = await handleSplitGas(tx, currentAccount.address, TESTNET_GAS_AMOUNTS);

            // 合并代币对象（如果有多个）
            mergeCoins(tx, coinObjects);

            // 调用 new_pool 函数
            tx.moveCall({
                typeArguments: [coinType],
                arguments: [
                    tx.object(coinObjects[0]), // 主代币对象
                    tx.object(poolTableId), // PoolTable ID
                    tx.object(TESTNET_GASPOOL),
                    tx.object(newCoin),
                    tx.object(transferRecordPoolId), // TransferRecordPool ID
                    tx.object(demoNftId), // DemoNFT ID
                    tx.object(extraParam), // 额外参数
                ],
                target: `${crabPackageId}::demo::new_pool`,
            });

            // 执行交易并等待结果
            const result = await signAndExecute({ transaction: tx });
            console.log("Deposit transaction executed:", result);

            // 如果交易成功，调用回调函数
            if (result && !isError) {
                onSuccess(); // 调用成功的回调函数
            }
        } catch (error) {
            console.error("Error executing new_pool transaction:", error);
        }
    }

    return (
        <Container>
            <Button
                size="3"
                onClick={executeNewPool}
                className="mark-as-scam-button"
                disabled={loading}
            >
                Recycle
            </Button>

        </Container>
    );
}

