import { Transaction } from "@mysten/sui/transactions";
import { Button, Container } from "@radix-ui/themes";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../config/networkConfig.ts";
import { handleSplitGas } from "../utils/splitCoinHelper.ts";
import { TESTNET_GAS_AMOUNTS, TESTNET_GASPOOL } from "../config/constants.ts";

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
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const crabPackageId = useNetworkVariable("crabPackageId");
    const currentAccount = useCurrentAccount();

    async function Withdraw_coin() {
        if (!currentAccount?.address) {
            console.error("No connected account found.");
            return;
        }

        try {
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

            // Execute the transaction
            const result = await signAndExecute({ transaction: tx });
            console.log("Withdraw transaction executed:", result);

            // Trigger the success callback if provided
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error executing withdraw transaction:", error);
        }
    }

    return (
        <Container>
            <Button
                size="3"
                onClick={Withdraw_coin}
                style={{
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                Withdraw
            </Button>
        </Container>
    );
}

export default Withdraw;
