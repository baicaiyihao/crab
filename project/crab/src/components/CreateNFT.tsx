import React, {useState} from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariable } from "../config/networkConfig";
import { TESTNET_GAS_AMOUNTS, TESTNET_GASPOOL, TESTNET_USERNFTTABLE, TESTNET_USERSTATE } from "../config/constants";
import { handleSplitGas } from "../utils/splitCoinHelper";

const CreateNFT: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const currentAccount = useCurrentAccount();
    const { mutateAsync: signAndExecute, isError } = useSignAndExecuteTransaction();
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
                className="bg-[#9E20CF] text-white py-[8px] px-[24px] rounded-[12px] flex items-center justify-center gap-[12px] w-[440px] h-[42px] absolute left-[calc(50%-440px/2)] top-[8px] text-[18px] font-semibold"
                onClick={create}
            >
        <span
            className="w-[140px] h-[28px] flex items-center justify-center text-center text-[18px] font-semibold leading-[28px] text-white">
            Create NFT Now
        </span>
            </button>
        </div>


    );
};

export default CreateNFT;
