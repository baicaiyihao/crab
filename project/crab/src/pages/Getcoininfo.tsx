import New_pool from "../components/new_pool";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState, useMemo } from "react";
import { getUserProfile } from "../utils";
import { CategorizedObjects, calculateTotalBalance } from "../utils/assetsHelpers";
import { TESTNET_CRAB_PACKAGE_ID, TESTNET_POOLTABLE, TESTNET_TIME, TESTNET_TRANSFERRECORDPOOL } from "../config/constants";
import Deposit from "../components/deposit";
import { fetchPoolIdForCoin } from "../utils/poolHelpers"; // 导入 helper
import { fetchTokenDecimals } from "../utils/tokenHelpers";
import suiClient from "../cli/suiClient";
import NFTModal from "../components/NFTModal";

export default function GetCoinInfo() {
    const account = useCurrentAccount();
    const [userObjects, setUserObjects] = useState<CategorizedObjects | null>(null);
    const [tokenDecimals, setTokenDecimals] = useState<{ [coinType: string]: number }>({});
    const [demoNftId, setDemoNftId] = useState<string | null>(null);
    const [coinPoolMap, setCoinPoolMap] = useState<{ [coinType: string]: string | null }>({});
    const [isLoading, setIsLoading] = useState<boolean>(true); // 新增加载状态
    const [copiedCoinType, setCopiedCoinType] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [itemsPerPage, setItemsPerPage] = useState(10); // 每页显示的项目数量
    const [currentPage, setCurrentPage] = useState(1); // 当前页码

    const formatCoinType = (coinType: string): string => {
        if (coinType.length > 20) {
            return `${coinType.slice(0, 6)}...${coinType.slice(-4)}`;
        }
        return coinType;
    };

    async function refreshUserProfile() {
        if (!account?.address) {
            return;
        }

        try {
            setIsLoading(true); // 开始加载时设置为 true

            await new Promise(resolve => setTimeout(resolve, 200)); // 延时 2 秒

            const profile = await getUserProfile(account.address);
            setUserObjects(profile);

            const coinTypes = Object.keys(profile.coins || {});
            for (const coinType of coinTypes) {
                // 使用 helper 方法获取精度
                const decimals = await fetchTokenDecimals(suiClient, coinType);
                setTokenDecimals(prev => ({ ...prev, [coinType]: decimals }));

                // 检查 poolId 是否存在
                const poolId = await fetchPoolIdForCoin(TESTNET_POOLTABLE, coinType);
                setCoinPoolMap(prev => ({ ...prev, [coinType]: poolId }));
            }

            const demoNftObject = Object.entries(profile.objects || {}).find(([objectType]) =>
                objectType.includes(`${TESTNET_CRAB_PACKAGE_ID}::demo::DemoNFT`)
            );
            if (demoNftObject) {
                const demoNftInstances = demoNftObject[1];
                if (Array.isArray(demoNftInstances) && demoNftInstances.length > 0) {
                    setDemoNftId(demoNftInstances[0]?.data?.objectId || null);
                } else {
                    setDemoNftId(null);
                }
            } else {
                setDemoNftId(null);
            }

        } catch (error) {
            console.error("Error fetching user profile:", error);
        } finally {
            setIsLoading(false); // 数据加载完毕后设置为 false
        }
    }

    useEffect(() => {
        // 初始加载时获取用户信息
        refreshUserProfile();
    }, [account]);

    const formatTokenBalance = (balance: bigint, decimals: number): string => {
        const integer = balance / BigInt(10 ** decimals);
        const decimal = (balance % BigInt(10 ** decimals)).toString().padStart(decimals, '0');
        return `${integer}.${decimal}`;
    };

    const handleCopyCoinType = (coinType: string) => {
        navigator.clipboard.writeText(coinType);
        setCopiedCoinType(coinType);
        setTimeout(() => setCopiedCoinType(null), 2000); // 2秒后清除已复制标识
    };

    // 计算分页数据
    const paginatedData = useMemo(() => {
        if (userObjects?.coins) {
            const coinEntries = Object.entries(userObjects.coins);
            const startIndex = (currentPage - 1) * itemsPerPage;
            return coinEntries.slice(startIndex, startIndex + itemsPerPage);
        }
        return [];
    }, [userObjects, currentPage, itemsPerPage]);

    // 计算总页数
    const totalPages = useMemo(() => {
        if (userObjects?.coins) {
            return Math.ceil(Object.entries(userObjects.coins).length / itemsPerPage);
        }
        return 0;
    }, [userObjects, itemsPerPage]);

    return (
        <div className="mt-8">
            {/* Token List Table */}
            <div className="overflow-hidden rounded-lg bg-[#1F1B2D] border border-purple-600">
                <table className="w-full text-left text-white border-collapse">
                    <thead className="bg-[#29263A]">
                    <tr>
                        <th className="px-6 py-3 border-t border-t-[#1E1C28]">#</th> {/* 序号 */}
                        <th className="px-6 py-3 border-t border-t-[#1E1C28]">Token</th>
                        <th className="px-6 py-3 border-t border-t-[#1E1C28]">Total Balance</th>
                        <th className="px-6 py-3 border-t border-t-[#1E1C28]">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        // 如果加载中，显示动画
                        Array.from({ length: 5 }).map((_, index) => (
                            <tr key={index} className="bg-[#29263A] border-t border-t-[#1E1C28] animate-pulse">
                                <td className="px-6 py-4 border-t border-t-[#1E1C28]">
                                    <div className="w-6 h-6 bg-gray-500 rounded-md"></div>
                                </td>
                                <td className="px-6 py-4 border-t border-t-[#1E1C28]">
                                    <div className="w-24 h-6 bg-gray-500 rounded-md"></div>
                                </td>
                                <td className="px-6 py-4 border-t border-t-[#1E1C28]">
                                    <div className="w-32 h-6 bg-gray-500 rounded-md"></div>
                                </td>
                                <td className="px-6 py-4 border-t border-t-[#1E1C28]">
                                    <div className="w-16 h-6 bg-gray-500 rounded-md"></div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        paginatedData.length > 0 ? (
                            paginatedData.map(([coinType, coins], index) => {
                                const coinObjectIds = coins.map((coin) => coin.data?.objectId || "N/A");
                                const totalBalance = calculateTotalBalance(coins);

                                const decimals = tokenDecimals[coinType] ?? 9;
                                const formattedBalance = formatTokenBalance(
                                    totalBalance.integer * BigInt(10 ** 9) + BigInt(totalBalance.decimal),
                                    decimals
                                );
                                const poolId = coinPoolMap[coinType];

                                return (
                                    <tr
                                        key={index}
                                        className={`${
                                            index % 2 === 0 ? "bg-[#29263A]" : "bg-[#26223B]"
                                        } border-t border-t-[#1E1C28] hover:bg-[#444151]`}
                                    >
                                        <td className="px-6 py-4 border-t border-t-[#1E1C28] text-white">{index + 1}</td> {/* 序号 */}
                                        <td className="px-6 py-4 border-t border-t-[#1E1C28] text-white">
                                            <div className="font-bold text-purple-300">{coinType.split("::").pop()}</div>
                                            <div
                                                className="text-sm text-gray-400 cursor-pointer relative group"
                                                onClick={() => handleCopyCoinType(coinType)}
                                            >
                                                <span>{`${formatCoinType(coinType)}`}</span>
                                                {copiedCoinType === coinType && (
                                                    <span className="ml-2 text-green-500">☑️</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-t border-t-[#1E1C28] text-white">{formattedBalance}</td>
                                        <td className="px-6 py-4 border-t border-t-[#1E1C28]">
                                            {demoNftId ? (
                                                poolId ? (
                                                    <Deposit
                                                        coinType={coinType}
                                                        poolId={poolId}
                                                        coinObjects={coinObjectIds}
                                                        demoNftId={demoNftId}
                                                        transferRecordPoolId={TESTNET_TRANSFERRECORDPOOL}
                                                        extraParam={TESTNET_TIME}
                                                        onSuccess={refreshUserProfile}
                                                    />
                                                ) : (
                                                    <New_pool
                                                        crabPackageId={TESTNET_CRAB_PACKAGE_ID}
                                                        coinType={coinType}
                                                        coinObjects={coinObjectIds}
                                                        poolTableId={TESTNET_POOLTABLE}
                                                        demoNftId={demoNftId}
                                                        transferRecordPoolId={TESTNET_TRANSFERRECORDPOOL}
                                                        extraParam={TESTNET_TIME}
                                                        onSuccess={refreshUserProfile}
                                                    />
                                                )
                                            ) : (
                                                <div>
                                                    <button
                                                        className="mark-as-scam-button"
                                                        onClick={() => setIsModalOpen(true)}
                                                    >
                                                        Recycle
                                                    </button>
                                                    {isModalOpen && (
                                                        <NFTModal
                                                            onClose={() => setIsModalOpen(false)}
                                                            onSuccess={() => {
                                                                setIsModalOpen(false);
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-red-500">No tokens found</td>
                            </tr>
                        )
                    )}
                    </tbody>
                </table>
            </div>

            {/* 分页控件 */}
            <div className="flex items-center justify-between mt-6">
                <div className="flex items-center">
                    <span className="text-white mr-4">Show:</span>
                    <select
                        className="px-4 py-2 rounded-lg border border-gray-700 bg-[#1F1B2D] text-white"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                        {[10, 20, 50].map((num) => (
                            <option key={num} value={num}>
                                {num}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center">
                    <span className="text-white mr-4">Total: {userObjects?.coins ? Object.entries(userObjects.coins).length : 0}</span>
                </div>
                <div className="flex items-center">
                    <button
                        className="px-4 py-2 mx-1 text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                        &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            className={`px-4 py-2 mx-1 text-white rounded-md ${
                                currentPage === page
                                    ? "bg-purple-600"
                                    : "bg-[#29263A] hover:bg-[#444151]"
                            }`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        className="px-4 py-2 mx-1 text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    >
                        &gt;
                    </button>
                </div>
            </div>
        </div>
    );

}
