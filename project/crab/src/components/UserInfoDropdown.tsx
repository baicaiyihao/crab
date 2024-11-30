import React, { useState, useEffect, useRef } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { getUserProfile } from "../utils";
import { TESTNET_CRAB_PACKAGE_ID, TESTNET_GAS_AMOUNTS, TESTNET_GASPOOL, TESTNET_USERNFTTABLE, TESTNET_USERSTATE } from "../config/constants";
import { handleSplitGas } from "../utils/splitCoinHelper";
import suiClient from "../cli/suiClient";
import usericon from "../assets/home/usericon.webp";


const UserInfoDropdown: React.FC = () => {
    const account = useCurrentAccount();  // 获取当前账户信息
    const { mutateAsync: signAndExecute, isError } = useSignAndExecuteTransaction();  // 执行交易
    const [userPoints, setUserPoints] = useState<number | null>(null);  // 用户积分
    const [userRank, setUserRank] = useState<number | null>(null);  // 用户排名
    const [hasNFT, setHasNFT] = useState<boolean | null>(null);  // 是否拥有 NFT
    const [isCreatingNFT, setIsCreatingNFT] = useState<boolean>(false);  // NFT 创建中状态
    const [isUserInfoVisible, setIsUserInfoVisible] = useState<boolean>(false); // 控制用户信息面板展示
    const [loading, setLoading] = useState<boolean>(false);  // 控制加载状态
    const dropdownRef = useRef<HTMLDivElement>(null); // 下拉菜单容器的引用
    const panelRef = useRef<HTMLDivElement>(null); // 用户信息面板的引用

    // 获取用户信息
    const fetchUserInfo = async () => {
        if (!account?.address) return;  // 如果没有连接钱包，直接返回

        try {
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

            // 获取用户排名信息
            await fetchUserRanking();
        } catch (error) {
            console.error("Error fetching user info:", error);
        }
    };

    // 获取用户排名
    const fetchUserRanking = async () => {
        if (!account?.address) return;
        setLoading(true);

        try {
            // 获取 NFT 表数据
            const userNftTable = await suiClient.getObject({
                id: TESTNET_USERNFTTABLE,
                options: { showContent: true },
            });

            const content = userNftTable?.data?.content;
            if (content?.dataType === "moveObject" && (content as any)?.fields?.mappings) {
                const mappings = (content as any).fields.mappings;

                if (Array.isArray(mappings)) {
                    // 获取所有用户的数据
                    const userData = await Promise.all(
                        mappings.map(async (mapping) => {
                            const userAddress = mapping?.fields?.user_address || "Unknown";
                            const nftId = mapping?.fields?.nft_id || "Unknown";

                            // 获取 NFT 的数据
                            const nftData = await suiClient.getObject({
                                id: nftId,
                                options: { showContent: true },
                            });

                            let points = 0;
                            if (nftData?.data?.content) {
                                const contentJson = JSON.parse(JSON.stringify(nftData.data.content));
                                points = contentJson?.fields?.users_points || 0;
                            }

                            return {
                                userAddress,
                                points: Number(points),
                            };
                        })
                    );

                    // 排序用户数据，按积分从高到低
                    const sortedData = userData.sort((a, b) => b.points - a.points);

                    // 找到当前用户的积分和排名
                    const currentUserAddress = account?.address;
                    const currentUserData = sortedData.find(
                        (user) => user.userAddress === currentUserAddress
                    );

                    if (currentUserData) {
                        const userRank = sortedData.findIndex(
                            (user) => user.userAddress === currentUserAddress
                        ) + 1;  // 排名从 1 开始
                        setUserPoints(currentUserData.points);  // 设置用户积分
                        setUserRank(userRank);  // 设置用户排名
                    } else {
                        setUserPoints(0);
                        setUserRank(null);  // 当前用户没有排名
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching user ranking:", error);
        } finally {
            setLoading(false);
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

            if (result && !isError) {
                await fetchUserInfo();
            }
        } catch (error) {
            console.error("Error creating NFT:", error);
        } finally {
            setIsCreatingNFT(false);  // 恢复状态
        }
    };

    // 展示/隐藏用户信息
    const toggleUserInfo = () => {
        setIsUserInfoVisible(!isUserInfoVisible);
    };

    // 点击外部区域时关闭用户信息面板
    const handleClickOutside = (event: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(event.target as Node) &&
            dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsUserInfoVisible(false);
        }
    };

    useEffect(() => {
        if (account?.address) {
            fetchUserInfo();  // 获取用户信息
        } else {
            setUserPoints(null);
            setHasNFT(null);  // 如果未连接钱包，清空状态
        }

        // 每 5 秒刷新用户信息
        const intervalId = setInterval(() => {
            if (account?.address) {
                fetchUserInfo();
            }
        }, 5000);  // 5秒刷新一次

        // 监听点击事件
        document.addEventListener('click', handleClickOutside);

        // 清理定时器和事件监听
        return () => {
            clearInterval(intervalId);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [account]);  // 当 account 改变时，重新获取信息

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className={`flex items-center px-4 py-2 ${hasNFT ? "bg-[#29263A] hover:bg-[#3A3A4D]" : "bg-[#29263A] hover:bg-[#3A3A4D]"} text-white rounded-lg transition`}
                onClick={hasNFT ? toggleUserInfo : createNFT}  // 如果有NFT，点击时切换用户信息；否则创建 NFT
                disabled={!account?.address || (!hasNFT && isCreatingNFT)}  // 未连接钱包或正在创建 NFT 时禁用按钮
            >
                <img src={usericon} alt="User Icon" className="w-5 h-5 mr-2" />
                {account?.address === null
                    ? "N/A"  // 未连接钱包时直接显示 N/A
                    : hasNFT === null
                        ? "N/A"  // 连接钱包但没有 NFT 时显示 N/A
                        : hasNFT
                            ? `${userPoints} Points`
                            : isCreatingNFT
                                ? "Creating..."
                                : "Create NFT"
                }
            </button>

            {/* 用户信息面板 */}
            {isUserInfoVisible && hasNFT && (
                <div ref={panelRef} className="absolute top-full mt-2 right-0 w-56 p-4 bg-[#23212F] border border-[#3C3A4D] rounded-lg text-white">
                    {loading ? (
                        <p>Loading...</p>  // 加载状态
                    ) : userRank === null ? (
                        <p>No ranking available</p>  // 如果没有排名，显示提示
                    ) : (
                        <>
                            <p>User Rank: #{userRank}</p>
                            <p>Points: {userPoints}</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserInfoDropdown;
