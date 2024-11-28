import React, { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { TESTNET_USERNFTTABLE } from "../config/constants";
import suiClient from "../cli/suiClient";

const Points: React.FC = () => {
    const account = useCurrentAccount();
    const [userPoints, setUserPoints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const shortenAddress = (address: string, chars = 6) => {
        return `${address.slice(0, chars)}...${address.slice(-chars)}`;
    };

    // 加载用户积分数据
    async function fetchUserPoints() {
        setLoading(true);
        try {
            const userNftTable = await suiClient.getObject({
                id: TESTNET_USERNFTTABLE,
                options: { showContent: true },
            });

            const content = userNftTable?.data?.content;
            if (
                content?.dataType === "moveObject" &&
                (content as any)?.fields?.mappings
            ) {
                const mappings = (content as any).fields.mappings;

                if (Array.isArray(mappings)) {
                    const userData = await Promise.all(
                        mappings.map(async (mapping) => {
                            const userAddress = mapping?.fields?.user_address || "Unknown";
                            const nftId = mapping?.fields?.nft_id || "Unknown";

                            const nftData = await suiClient.getObject({
                                id: nftId,
                                options: { showContent: true },
                            });

                            let points = 0;
                            if (nftData?.data?.content) {
                                const contentJson = JSON.parse(
                                    JSON.stringify(nftData.data.content)
                                );
                                points = contentJson?.fields?.users_points || 0;
                            }

                            return {
                                userAddress,
                                points: Number(points),
                            };
                        })
                    );

                    const sortedData = userData.sort((a, b) => b.points - a.points);
                    setUserPoints(sortedData);
                }
            }
        } catch (error) {
            console.error("Error fetching user points:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
            fetchUserPoints();
    }, [account]);

    // 搜索和分页逻辑
    const filteredData = userPoints.filter((user) =>
        user.userAddress.toLowerCase().includes(searchQuery.toLowerCase())
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

    // 显示加载动画
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent border-solid rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-white mb-4">Rewards</h1>
            <p className="text-lg text-gray-400 mb-8">Leaderboard of user points</p>

            {/* 搜索框 */}
            <div className="flex items-center justify-between mb-4 bg-[#29263A] p-4 rounded-lg">
                <h2 className="text-white text-xl font-semibold">Leaderboard</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by address"
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
                        <th className="px-6 py-3">User Address</th>
                        <th className="px-6 py-3">Points</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedData.map((user, index) => (
                        <tr
                            key={index}
                            className="border-t border-t-[#1E1C28] hover:bg-[#444151]"
                        >
                            <td className="px-6 py-4 text-gray-400">{startIndex + index + 1}</td>
                            <td className="px-6 py-4 text-gray-400">{shortenAddress(user.userAddress)}</td>
                            <td className="px-6 py-4 text-gray-400">{user.points}</td>
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

export default Points;
