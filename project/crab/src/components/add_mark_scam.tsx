import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../config/networkConfig";
import { handleSplitGas } from "../utils/splitCoinHelper";
import { TESTNET_GAS_AMOUNTS, TESTNET_GASPOOL, TESTNET_SCAMCOINPOOL } from "../config/constants";
import "../styles/MarkAsScamButton.css"

interface AddMarkScamProps {
    poolId: string;
    scamCoinId: string;
    coinType: string;
    demoNftId: string;
    onSuccess: () => void;
}

export default function AddMarkScam({ poolId, scamCoinId, coinType, demoNftId, onSuccess }: AddMarkScamProps) {
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const currentAccount = useCurrentAccount();
    const crabPackageId = useNetworkVariable("crabPackageId");

    async function addMarkAsScam() {
        if (!currentAccount?.address) {
            console.error("No connected account found.");
            return;
        }

        try {
            const tx = new Transaction();
            tx.setGasBudget(100000000);
            const newCoin = await handleSplitGas(tx, currentAccount.address, TESTNET_GAS_AMOUNTS);

            // 调用 add_mark_scam 函数
            tx.moveCall({
                typeArguments: [coinType],
                arguments: [
                    tx.object(poolId),
                    tx.object(TESTNET_GASPOOL),
                    tx.object(newCoin),
                    tx.object(scamCoinId),
                    tx.object(TESTNET_SCAMCOINPOOL),
                    tx.object(demoNftId),
                ],
                target: `${crabPackageId}::demo::add_mark_scam`,
            });

            // 执行交易
            await signAndExecute({ transaction: tx });

            console.log(tx);
            if (onSuccess) {
                onSuccess(); // 成功后调用回调函数
            }
        } catch (error) {
            console.error("Error executing addMarkAsScam transaction:", error);
        }
    }

    return (
        <button
            type="button"
            onClick={addMarkAsScam}
            className="mark-as-scam-button"
        >
            Mark as Scam
        </button>
    );
}
