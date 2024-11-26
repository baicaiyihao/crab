import React, { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { TESTNET_SCAMCOINPOOL } from "../config/constants";
import suiClient from "../cli/suiClient";

const Risk: React.FC = () => {
    const account = useCurrentAccount();
    const [scamCoinList, setScamCoinList] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

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
        if (account?.address) {
            fetchScamCoinInfo();
        }
    }, [account]);

    const filteredData = scamCoinList.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent border-solid rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-white mb-4">Risk</h1>
            <p className="text-lg text-gray-400 mb-8">Scam Coin Leaderboard</p>

            <div className="flex items-center justify-between mb-4 bg-[#29263A] p-4 rounded-lg">
                <h2 className="text-white text-xl font-semibold">Scam Coins</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search token"
                        className="px-4 py-2 rounded-lg border border-gray-700 bg-[#1F1B2D] text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-purple-600 bg-[#1F1B2D]">
                <table className="w-full text-left">
                    <thead className="bg-[#29263A] text-white">
                    <tr>
                        <th className="px-6 py-3">Rank</th>
                        <th className="px-6 py-3">Scam Coin Name</th>
                        <th className="px-6 py-3">Mark Times</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedData.map((item, index) => (
                        <tr
                            key={index}
                            className={`text-white ${
                                index % 2 === 0 ? "bg-[#26223B]" : "bg-[#29263A]"
                            }`}
                        >
                            <td className="px-6 py-4">{startIndex + index + 1}</td>
                            <td className="px-6 py-4">{item.name}</td>
                            <td className="px-6 py-4">{item.checknum}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

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
                                    ? "bg-purple-700"
                                    : "bg-purple-600 hover:bg-purple-700"
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
