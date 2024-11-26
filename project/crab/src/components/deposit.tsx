import { Transaction } from "@mysten/sui/transactions";
import { Button, Container } from "@radix-ui/themes";
import {useCurrentAccount, useSignAndExecuteTransaction} from "@mysten/dapp-kit";
import { useNetworkVariable } from "../config/networkConfig";
import { mergeCoins } from "../utils/mergeCoinsHelper";
import {handleSplitGas} from "../utils/splitCoinHelper";
import {TESTNET_GAS_AMOUNTS, TESTNET_GASPOOL} from "../config/constants";


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
    const {mutate: signAndExecute} = useSignAndExecuteTransaction();
    const crabPackageId = useNetworkVariable("crabPackageId");
    const currentAccount = useCurrentAccount();

    async function Deposit_coin() {
        if (!currentAccount?.address) {
            console.error("No connected account found.");
            return;
        }
        try {
            const tx = new Transaction();

            tx.setGasBudget(100000000);
            const newCoin = await handleSplitGas(tx, currentAccount.address, TESTNET_GAS_AMOUNTS);

            mergeCoins(tx, coinObjects);
            // 合并代币对象
            console.log(coinObjects[0])
            console.log(poolId)

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


            // 执行交易
            signAndExecute({transaction: tx});
            if (onSuccess) {
                onSuccess(); // 调用回调刷新数据
            }
        } catch (error) {
            console.error("Error executing deposit transaction:", error);
        }
    }

    return (
        <Container>
            <Button
                size="3"
                onClick={Deposit_coin}
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
