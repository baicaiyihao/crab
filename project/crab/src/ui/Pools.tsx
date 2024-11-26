import React, { useState, useEffect } from "react";
import { fetchPoolInfo } from "../utils/poolService";

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div
                className="w-16 h-16 border-4 border-purple-600 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
    );
};

const Pools: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const tokenDecimals = {}; // 缓存 token decimals

    useEffect(() => {
        const loadPools = async () => {
            setLoading(true);
            try {
                const poolData = await fetchPoolInfo(tokenDecimals);
                setData(poolData);
            } catch (error) {
                console.error("Error fetching pool data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadPools();
    }, []);

    const filteredData = data.filter((item) =>
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
            <div className="h-screen flex justify-center items-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-white mb-4">Pools</h1>
            <p className="text-lg text-gray-400 mb-8">The full list of Base inscriptions</p>

            <div className="flex items-center justify-between mb-4 bg-[#29263A] p-4 rounded-lg">
                <h2 className="text-white text-xl font-semibold">Asset</h2>
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
                        <th className="px-6 py-3">Pool Coin Name</th>
                        <th className="px-6 py-3">Pool ID</th>
                        <th className="px-6 py-3">Balance</th>
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
                            <td className="px-6 py-4">{item.poolId}</td>
                            <td className="px-6 py-4">{item.formattedBalance}</td>
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

export default Pools;
