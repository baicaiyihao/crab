import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../config/networkConfig.ts";
import {TESTNET_GAS_AMOUNTS, TESTNET_GASPOOL, TESTNET_USERNFTTABLE, TESTNET_USERSTATE} from "../config/constants.ts";
import {handleSplitGas} from "../utils/splitCoinHelper.ts";

export default function CreateNFT({ onSuccess }: { onSuccess: () => void }) {
    const currentAccount = useCurrentAccount();
    const crabPackageId = useNetworkVariable("crabPackageId");
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();

    // 创建 NFT 函数
    async function create() {
        if (!currentAccount?.address) {
            console.error("No connected account found.");
            return;
        }

        try {
            const tx = new Transaction();
            tx.setGasBudget(10000000);
            const newCoin = await handleSplitGas(tx, currentAccount.address, TESTNET_GAS_AMOUNTS);
            // 构建交易
            tx.moveCall({
                arguments: [
                    tx.object(TESTNET_GASPOOL),
                    tx.object(newCoin),
                    tx.object(TESTNET_USERNFTTABLE),
                    tx.object(TESTNET_USERSTATE),
                ],
                target: `${crabPackageId}::demo::mint_user_nft`,
            });


            // 签名并执行交易
            signAndExecute({
                transaction: tx,
            });

            console.log("NFT created successfully!");
            if (onSuccess) {
                onSuccess(); // 调用回调刷新数据
            }
        } catch (error) {
            console.error("Error creating NFT:", error);
        }
    }

    // 样式化组件
    return (
        <div style={{ padding: "20px" }}>
            <button
                style={{
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginBottom: "20px",
                }}
                onClick={create}
            >
                创建NFT
            </button>
        </div>
    );
}
