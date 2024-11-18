import { Transaction } from "@mysten/sui/transactions";
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useNetworkVariable } from "./networkConfig";
import { TESTNET_USERNFTTABLE, TESTNET_USERSTATE } from "./constants.ts";

export default function CreateNFT({ onSuccess }: { onSuccess: () => void }) {
    const tx = new Transaction();
    const crabPackageId = useNetworkVariable("crabPackageId");
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();

    async function create() {
        tx.moveCall({
            arguments: [tx.object(TESTNET_USERNFTTABLE), tx.object(TESTNET_USERSTATE)],
            target: `${crabPackageId}::demo::mint_user_nft`,
        });

        try {
            await signAndExecute({
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
