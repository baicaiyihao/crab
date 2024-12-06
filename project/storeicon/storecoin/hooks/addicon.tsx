import React, { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import {bcs} from "@mysten/sui/bcs";

const AddIcon: React.FC = () => {
    const currentAccount = useCurrentAccount();
    const { mutateAsync: signAndExecute, isError } = useSignAndExecuteTransaction();
    const [name, setName] = useState<string>(""); // 输入的名称
    const [blobId, setBlobId] = useState<string>(""); // 输入的 Blob ID
    const [isLoading, setLoading] = useState(false); // 加载状态
    const [resultMessage, setResultMessage] = useState<string | null>(null); // 交易结果信息

    const handleAddIcon = async () => {
        if (!currentAccount?.address) {
            console.error("No connected account found.");
            setResultMessage("Please connect your wallet.");
            return;
        }

        try {
            setLoading(true); // 设置加载状态
            setResultMessage(null); // 清空结果信息

            const tx = new Transaction();
            tx.setGasBudget(10000000); // 设置 Gas 预算

            tx.moveCall({
                arguments: [
                    tx.pure(bcs.string().serialize(name).toBytes()), // 用户输入的名称
                    tx.pure(bcs.string().serialize(blobId).toBytes()), // 用户输入的 Blob ID
                    tx.object("0xf8a5237b86cff9fc42e8f59f5d7c925c084221c15f5cc84061b0745610bf4529"), // 固定参数
                ],
                target: "0xc5abe2c8c58ae4ff3e2292f13c11b32b6aabb5e3f40577b25ea0667328b9a88b::storeicon::add_icon", // 调用目标
            });

            // 执行交易并等待结果
            const result = await signAndExecute({ transaction: tx });
            console.log("Add Icon transaction executed:", result);

            // 如果交易成功，显示成功消息
            if (result && !isError) {
                setResultMessage(`Transaction Successful: ${result.digest}`);
            } else {
                setResultMessage("Transaction failed.");
            }
        } catch (error) {
            console.error("Error adding icon:", error);
            setResultMessage(`Error`);
        } finally {
            setLoading(false); // 结束加载状态
        }
    };

    return (
        <div>
            <h1>Add Icon</h1>
            <div>
                <label>
                    Name:
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name"
                        className="input-box"
                    />
                </label>
            </div>
            <div>
                <label>
                    Blob ID:
                    <input
                        type="text"
                        value={blobId}
                        onChange={(e) => setBlobId(e.target.value)}
                        placeholder="Enter Blob ID"
                        className="input-box"
                    />
                </label>
            </div>
            <button
                onClick={handleAddIcon}
                className="button-text"
                disabled={isLoading} // 禁用按钮在加载时
            >
                {isLoading ? "Submitting..." : "Add Icon"}
            </button>
            {resultMessage && <p>{resultMessage}</p>}
        </div>
    );
};

export default AddIcon;
