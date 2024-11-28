import React, {useState} from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariable } from "../config/networkConfig";
import { TESTNET_GAS_AMOUNTS, TESTNET_GASPOOL, TESTNET_USERNFTTABLE, TESTNET_USERSTATE } from "../config/constants";
import { handleSplitGas } from "../utils/splitCoinHelper";

const CreateNFT: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const currentAccount = useCurrentAccount();
    const { mutateAsync: signAndExecute, isError, error } = useSignAndExecuteTransaction();
    const crabPackageId = useNetworkVariable("crabPackageId");
    const [, setLoading] = useState(false);


    const create = async () => {
        if (!currentAccount?.address) {
            console.error("No connected account found.");
            return;
        }

        try {
            setLoading(true); // 设置加载状态

            const tx = new Transaction();
            tx.setGasBudget(10000000);
            const newCoin = await handleSplitGas(tx, currentAccount.address, TESTNET_GAS_AMOUNTS);

            tx.moveCall({
                arguments: [
                    tx.object(TESTNET_GASPOOL),
                    tx.object(newCoin),
                    tx.object(TESTNET_USERNFTTABLE),
                    tx.object(TESTNET_USERSTATE),
                ],
                target: `${crabPackageId}::demo::mint_user_nft`,
            });

            // 执行交易并等待结果
            const result = await signAndExecute({ transaction: tx });
            console.log("Deposit transaction executed:", result);

            // 如果交易成功，调用回调函数
            if (result && !isError) {
                onSuccess(); // 调用成功的回调函数
            }
        } catch (error) {
            console.error("Error creating NFT:", error);
        }
    };

    return (
        <div>
            <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                onClick={create}
            >
                创建 NFT
            </button>
            {isError && <p style={{ color: 'red' }}>Error: {error.message}</p>}
        </div>
    );
};

export default CreateNFT;
