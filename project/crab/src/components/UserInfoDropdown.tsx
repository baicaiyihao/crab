import React, { useState, useEffect, useRef } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { getUserProfile } from "../utils";
import { TESTNET_CRAB_PACKAGE_ID, TESTNET_GAS_AMOUNTS, TESTNET_GASPOOL, TESTNET_USERNFTTABLE, TESTNET_USERSTATE } from "../config/constants";
import { handleSplitGas } from "../utils/splitCoinHelper";
import usericon from "../assets/home/usericon.webp";

const UserInfoDropdown: React.FC = () => {
    const account = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();
    const [userPoints, setUserPoints] = useState<number>(0);
    const [hasNFT, setHasNFT] = useState<boolean>(true); // 是否拥有 NFT
    const [isCreatingNFT, setIsCreatingNFT] = useState<boolean>(false); // NFT 创建中状态
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchUserInfo = async () => {
        try {
            if (account?.address) {
                const profile = await getUserProfile(account.address);

                const demoNFT = Object.entries(profile.objects || {}).find(([objectType]) =>
                    objectType.includes(`${TESTNET_CRAB_PACKAGE_ID}::demo::DemoNFT`)
                );

                if (demoNFT) {
                    const demoNFTData = demoNFT[1];
                    if (Array.isArray(demoNFTData) && demoNFTData.length > 0) {
                        const firstNFT = demoNFTData[0];
                        const content = firstNFT?.data?.content;

                        if (content && typeof content === "object") {
                            const fields = JSON.parse(JSON.stringify(content)).fields || {};
                            setUserPoints(fields?.users_points || 0);
                            setHasNFT(true); // 用户有 NFT
                        }
                    }
                } else {
                    setHasNFT(false); // 没有 NFT
                }
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    };

    const createNFT = async () => {
        if (!account?.address) {
            console.error("No connected account found.");
            return;
        }

        setIsCreatingNFT(true); // 设置创建中状态
        try {
            const tx = new Transaction();
            tx.setGasBudget(10000000);
            const newCoin = await handleSplitGas(tx, account.address, TESTNET_GAS_AMOUNTS);

            tx.moveCall({
                arguments: [
                    tx.object(TESTNET_GASPOOL),
                    tx.object(newCoin),
                    tx.object(TESTNET_USERNFTTABLE),
                    tx.object(TESTNET_USERSTATE),
                ],
                target: `${TESTNET_CRAB_PACKAGE_ID}::demo::mint_user_nft`,
            });

            await signAndExecute({ transaction: tx }); // 执行交易
            console.log("NFT created successfully!");
            await fetchUserInfo(); // 刷新用户信息
        } catch (error) {
            console.error("Error creating NFT:", error);
        } finally {
            setIsCreatingNFT(false); // 恢复状态
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, [account]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className={`flex items-center px-4 py-2 ${
                    hasNFT ? "bg-[#29263A] hover:bg-[#3A3A4D]" : "bg-[#29263A] hover:bg-[#3A3A4D]"
                } text-white rounded-lg transition`}
                onClick={hasNFT ? undefined : createNFT} // 如果有 NFT，不绑定点击事件
                disabled={!hasNFT && isCreatingNFT} // 禁用按钮
            >
                <img src={usericon} alt="User Icon" className="w-5 h-5 mr-2" />
                {hasNFT ? userPoints : isCreatingNFT ? "Creating..." : "Create NFT"}
            </button>
        </div>
    );
};

export default UserInfoDropdown;
