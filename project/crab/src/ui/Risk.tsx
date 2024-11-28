import React, { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { TESTNET_SCAMCOINPOOL } from "../config/constants";
import suiClient from "../cli/suiClient";

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
    );
};

const Risk: React.FC = () => {
    const account = useCurrentAccount();
    const [scamCoinList, setScamCoinList] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [copiedCoinType, setCopiedCoinType] = useState<string | null>(null); // 用于存储复制的 coinType

    const formatCoinType = (coinType: string): string => {
        if (coinType.length > 20) {
            return `${coinType.slice(0, 6)}...${coinType.slice(-4)}`;
        }
        return coinType;
    };

    async function fetchScamCoinInfo() {
        setLoading(true);
        try {
            const scamCoinPool = await suiClient.getObject({
                id: TESTNET_SCAMCOINPOOL,
                options: { showContent: true },
            });

            const content = scamCoinPool?.data?.content;
            if (
                content?.dataType === "moveObject" &&
                (content as any)?.fields?.ScamCoin_map
            ) {
                const scamCoinMap = (content as any).fields.ScamCoin_map;

                if (Array.isArray(scamCoinMap)) {
                    const scamCoins = await Promise.all(
                        scamCoinMap.map(async (scamCoinInfo) => {
                            const scamCoinId = scamCoinInfo?.fields?.ScamCoin_id || "Unknown";
                            const rawCoinType = scamCoinInfo?.fields?.cointype?.fields?.name || "Unknown";

                            if (!scamCoinId || scamCoinId === "Unknown") {
                                console.warn("Invalid ScamCoin ID, skipping:", scamCoinId);
                                return null;
                            }

                            try {
                                const scamCoinData = await suiClient.getObject({
                                    id: scamCoinId,
                                    options: { showContent: true },
                                });

                                let checknum = 0;
                                let cointype = "Unknown";
                                if (scamCoinData?.data?.content) {
                                    const contentJson = JSON.parse(
                                        JSON.stringify(scamCoinData.data.content)
                                    );
                                    checknum = parseInt(contentJson?.fields?.checknum || "0", 10);
                                    cointype = contentJson?.fields?.cointype?.fields?.name || rawCoinType;
                                }

                                return {
                                    name: `0x${cointype}`.split("::").pop(),
                                    scamCoinId,
                                    checknum,
                                    cointype, // 添加cointype字段
                                };
                            } catch (error) {
                                console.error(`Error fetching ScamCoin ID ${scamCoinId}:`, error);
                                return null;
                            }
                        })
                    );

                    const filteredScamCoins = scamCoins.filter((coin) => coin !== null);
                    const sortedScamCoins = filteredScamCoins.sort((a, b) => b.checknum - a.checknum);

                    setScamCoinList(sortedScamCoins);
                }
            }
        } catch (error) {
            console.error("Error fetching ScamCoin info:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
            fetchScamCoinInfo();
    }, [account]);

    // 搜索功能
    const filteredData = scamCoinList.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 分页逻辑
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getPagination = () => {
        const pages = [];
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            pages.push(i);
        }
        return pages;
    };

    // 复制功能
    const handleCopy = (text: string) => {
        const cointype = "0x" + text;
        navigator.clipboard.writeText(cointype).then(() => {
            setCopiedCoinType(text);
            setTimeout(() => setCopiedCoinType(null), 2000); // 2秒后恢复状态
        }).catch((error) => {
            console.error('Failed to copy:', error);
        });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-white mb-4">Scam Coins</h1>
            <p className="text-lg text-gray-400 mb-8">List of scam coins with their details</p>

            {/* 搜索框 */}
            <div className="flex items-center justify-between mb-4 bg-[#29263A] p-4 rounded-lg">
                <h2 className="text-white text-xl font-semibold">Leaderboard</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by scam coin name"
                        className="px-4 py-2 rounded-lg border border-gray-700 bg-[#1F1B2D] text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* 表格 */}
            <div className="overflow-hidden rounded-lg border border-purple-600 bg-[#1F1B2D]">
                <table className="w-full text-left">
                    <thead className="bg-[#29263A] text-white">
                    <tr>
                        <th className="px-6 py-3">Rank</th>
                        <th className="px-6 py-3">Scam Coin</th>
                        <th className="px-6 py-3">Check Number</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedData.map((coin, index) => (
                        <tr key={coin.scamCoinId} className="border-t border-t-[#1E1C28] hover:bg-[#444151]">
                            <td className="px-6 py-4 text-gray-400">{startIndex + index + 1}</td>
                            <td className="px-6 py-4 text-gray-400">
                                <div className="text-purple-300 font-bold">{coin.name}</div>
                                <div
                                    className="text-sm text-gray-400 cursor-pointer relative group"
                                    onClick={() => handleCopy(coin.cointype)}
                                >
                                    <span className="">{`0x${formatCoinType(coin.cointype)}::${coin.name}`}</span>
                                    {copiedCoinType === coin.cointype && (
                                        <span className="ml-2 text-green-500">☑️</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-400">{coin.checknum}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* 分页 */}
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

                {/* 展示总数 */}
                <div className="flex items-center">
                    <span className="text-white mr-4">Total: {filteredData.length}</span>
                </div>

                <div className="flex items-center">
                    <button
                        className="px-4 py-2 mx-1 text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                        &lt;
                    </button>
                    {getPagination().map((page) => (
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
};

export default Risk;
