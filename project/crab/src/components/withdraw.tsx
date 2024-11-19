import { Transaction } from "@mysten/sui/transactions";
import { Button, Container } from "@radix-ui/themes";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../config/networkConfig.ts";

interface WithdrawProps {
    transferInRecordObject: string; // 转账记录对象 ID
    coinType: string; // 代币类型
    transferRecordPoolId: string; // Transfer Record Pool ID
    extraParam: string; // 额外参数
}

export function Withdraw({
                             transferInRecordObject,
                             coinType,
                             transferRecordPoolId,
                             extraParam,
                         }: WithdrawProps) {
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const crabPackageId = useNetworkVariable("crabPackageId");

    async function Withdraw_coin() {
        try {
            const tx = new Transaction();

            // 调用 withdraw 函数
            tx.moveCall({
                typeArguments: [coinType], // 动态传入代币类型
                arguments: [
                    tx.object(transferRecordPoolId), // 转账记录对象
                    tx.object(transferInRecordObject), // Transfer Record Pool ID
                    tx.object(extraParam), // 额外参数
                ],
                target: `${crabPackageId}::demo::withdraw`,
            });

            tx.setGasBudget(100000000); // 设置 Gas 预算

            // 执行交易
            const result = await signAndExecute({ transaction: tx });
            console.log("Withdraw transaction executed:", result);
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
