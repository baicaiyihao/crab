import React, { useState, useEffect, useRef } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { getUserProfile } from "../utils";
import { TESTNET_CRAB_PACKAGE_ID, TESTNET_GAS_AMOUNTS, TESTNET_GASPOOL, TESTNET_USERNFTTABLE, TESTNET_USERSTATE } from "../config/constants";
import { handleSplitGas } from "../utils/splitCoinHelper";
import usericon from "../assets/home/usericon.webp";

const UserInfoDropdown: React.FC = () => {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecute, isError } = useSignAndExecuteTransaction();
    const [, setLoading] = useState(false);
    const [userPoints, setUserPoints] = useState<number>(0);  // 用户积分
    const [hasNFT, setHasNFT] = useState<boolean>(true);  // 是否拥有 NFT
    const [isCreatingNFT, setIsCreatingNFT] = useState<boolean>(false);  // NFT 创建中状态
    const [isUserInfoVisible, setIsUserInfoVisible] = useState<boolean>(false); // 控制用户信息的展示
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 获取用户信息
    const fetchUserInfo = async () => {
        try {
            if (account?.address) {
                const profile = await getUserProfile(account.address);

                // 查找包含 DemoNFT 的对象
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
                            setHasNFT(true);  // 用户有 NFT
                        }
                    }
                } else {
                    setHasNFT(false);  // 用户没有 NFT
                }
            }
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    };

    // 创建 NFT
    const createNFT = async () => {
        if (!account?.address) {
            console.error("No connected account found.");
            return;
        }

        setIsCreatingNFT(true);  // 设置 NFT 创建中状态
        try {
            setLoading(true); // 设置加载状态
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

            const result = await signAndExecute({ transaction: tx });
            console.log("Deposit transaction executed:", result);

            // 如果交易成功，调用回调函数
            if (result && !isError) {
                await fetchUserInfo();
            }
        } catch (error) {
            console.error("Error creating NFT:", error);
        } finally {
            setIsCreatingNFT(false);  // 恢复状态
            setLoading(false);
        }
    };

    // 展示/隐藏用户信息
    const toggleUserInfo = () => {
        setIsUserInfoVisible(!isUserInfoVisible);
    };

    useEffect(() => {
        fetchUserInfo();  // 加载用户信息
        // 设置定时器每 30 秒刷新一次用户信息
        const intervalId = setInterval(() => {
            fetchUserInfo();
        }, 5000);  // 30秒

        // 清理定时器
        return () => {
            clearInterval(intervalId);
        };
    }, [account]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className={`flex items-center px-4 py-2 ${
                    hasNFT ? "bg-[#29263A] hover:bg-[#3A3A4D]" : "bg-[#29263A] hover:bg-[#3A3A4D]"
                } text-white rounded-lg transition`}
                onClick={hasNFT ? toggleUserInfo : createNFT}  // 如果有NFT，则点击时切换用户信息；否则创建 NFT
                disabled={!hasNFT && isCreatingNFT}  // 禁用按钮
            >
                <img src={usericon} alt="User Icon" className="w-5 h-5 mr-2" />
                {hasNFT ? `${userPoints} Points` : isCreatingNFT ? "Creating..." : "Create NFT"}
            </button>

            {/* 用户信息面板 */}
            {isUserInfoVisible && hasNFT && (
                <div className="absolute top-full mt-2 p-4 bg-[#29263A] text-white rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold">User Info</h3>
                    <p><strong>Address:</strong> {account?.address}</p>
                    <p><strong>Points:</strong> {userPoints}</p>
                    <p>Other user info can be displayed here...</p>
                </div>
            )}
        </div>
    );
};

export default UserInfoDropdown;
