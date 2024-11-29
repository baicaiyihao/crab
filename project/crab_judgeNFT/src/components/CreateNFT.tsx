import React from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useNetworkVariable } from "../config/networkConfig";
import { TESTNET_GAS_AMOUNTS, TESTNET_GASPOOL, TESTNET_USERNFTTABLE, TESTNET_USERSTATE } from "../config/constants";
import { handleSplitGas } from "../utils/splitCoinHelper";

const CreateNFT: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const currentAccount = useCurrentAccount();
    const { mutateAsync: signAndExecute, isError, error } = useSignAndExecuteTransaction();
    const crabPackageId = useNetworkVariable("crabPackageId");

    const createNFT = async () => {
        if (!currentAccount?.address) {
            console.error("No connected account found.");
            return;
        }

        try {

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
        } finally {
            console.log("Finished creating NFT");
        }
    };

    return (
      <div className="flex justify-center items-center" style={{ height: '100%' }}>
          <button
            className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
            onClick={createNFT}
          >
              CreateNFT
          </button>
          {isError && <p style={{ color: "red" }}>Error: {error.message}</p>}
      </div>
    )
      ;
};

export default CreateNFT;