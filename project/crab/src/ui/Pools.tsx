import React, {useState, useEffect, useMemo} from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { TESTNET_POOLTABLE, TESTNET_CRAB_PACKAGE_ID, TESTNET_SCAMCOINPOOL } from "../config/constants";
import { fetchTokenDecimals } from "../utils/tokenHelpers";
import suiClient from "../cli/suiClient";
import MarkScam from "../components/new_mark_scam";
import AddMarkScam from "../components/add_mark_scam";
import { getUserProfile } from "../utils";
import NFTModal from "../components/NFTModal";
import "../styles/MarkAsScamButton.css";

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
    );
};

const Pools: React.FC = () => {
    const account = useCurrentAccount();
    const [poolInfoList, setPoolInfoList] = useState<any[]>([]);
    const [tokenDecimals, setTokenDecimals] = useState<{ [coinType: string]: number }>({});
    const [demoNftId, setDemoNftId] = useState<string | null>(null);
    const [scamCoinMap, setScamCoinMap] = useState<{ [coinType: string]: string }>({});
    const [loading, setLoading] = useState(true);
    const [copiedPool, setCopiedPool] = useState<string | null>(null); // 用于存储已经复制的池类型
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // 搜索和分页逻辑
    const filteredData = useMemo(() => {
        return poolInfoList.filter((pool) =>
            pool.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, poolInfoList]);

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



    const formatTokenBalance = (balance: bigint, decimals: number): string => {
        const integer = balance / BigInt(10 ** decimals);
        const decimal = (balance % BigInt(10 ** decimals)).toString().padStart(decimals, '0');
        return `${integer}.${decimal.slice(0, 2)}`; // 默认保留两位小数
    };

    const truncateAddress = (address: string): string => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // 格式化池类型，头尾保留，使用...进行中间略缩
    const formatCoinType = (coinType: string): string => {
        if (coinType.length > 20) {
            return `${coinType.slice(0, 6)}...${coinType.slice(-4)}`;
        }
        return coinType;
    };

    const copyToClipboard = async (coinType: string) => {

        try {
            const cointype = "0x" + coinType;
            await navigator.clipboard.writeText(cointype); // 复制完整链接到剪贴板
            setCopiedPool(coinType); // 设置为已复制状态，显示勾选符号
            setTimeout(() => setCopiedPool(null), 2000); // 2秒后恢复状态
        } catch (error) {
            console.error("Failed to copy text: ", error);
        }
    };

    const refreshUserProfile = async () => {
        if (account?.address) {
            try {
                const profile = await getUserProfile(account.address);

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
            }
        }
    };

    const fetchScamCoinPool = async () => {
        try {
            const scamCoinPool = await suiClient.getObject({
                id: TESTNET_SCAMCOINPOOL,
                options: { showContent: true },
            });

            const content = scamCoinPool?.data?.content;
            if (content?.dataType === "moveObject" && (content as any)?.fields?.ScamCoin_map) {
                const scamCoinMap = (content as any).fields.ScamCoin_map.reduce(
                    (acc: { [coinType: string]: string }, scamCoin: { fields: { cointype: { fields: { name: string } }; ScamCoin_id: string } }) => {
                        const coinType = scamCoin?.fields?.cointype?.fields?.name || "Unknown";
                        const scamCoinId = scamCoin?.fields?.ScamCoin_id || "Unknown";
                        acc[coinType] = scamCoinId;
                        return acc;
                    },
                    {}
                );
                setScamCoinMap(scamCoinMap);
            }
        } catch (error) {
            console.error("Error fetching ScamCoinPool:", error);
        }
    };

    const fetchPoolInfo = async () => {
        setLoading(true);
        try {
            const poolTable = await suiClient.getObject({
                id: TESTNET_POOLTABLE,
                options: { showContent: true },
            });

            const content = poolTable?.data?.content;
            if (
                content?.dataType === "moveObject" &&
                (content as any)?.fields?.pool_map
            ) {
                const poolMap = (content as any).fields.pool_map;

                if (Array.isArray(poolMap)) {
                    const pools = await Promise.all(
                        poolMap.map(async (pool) => {
                            const rawName = pool?.fields?.cointype?.fields?.name || "Unknown";
                            const coinType = rawName;
                            const poolId = pool?.fields?.object || "Unknown";

                            const poolData = await suiClient.getObject({
                                id: poolId,
                                options: { showContent: true },
                            });

                            let balance = BigInt(0);
                            if (poolData?.data?.content) {
                                const contentJson = JSON.parse(
                                    JSON.stringify(poolData.data.content)
                                );
                                balance = BigInt(contentJson?.fields?.coin_x || "0");
                            }

                            let decimals = tokenDecimals[coinType];
                            if (decimals == null) {
                                try {
                                    decimals = await fetchTokenDecimals(suiClient, coinType);
                                    decimals = decimals ?? 2; // 默认精度为 2
                                } catch (error) {
                                    console.error(`Error fetching decimals for ${coinType}:`, error);
                                    decimals = 2; // 设置默认精度
                                }
                                setTokenDecimals((prev) => ({ ...prev, [coinType]: decimals }));
                            }

                            return {
                                name: coinType.split("::").pop(),
                                poolId,
                                balance,
                                formattedBalance: formatTokenBalance(balance, decimals),
                                rawCoinType: coinType,
                            };
                        })
                    );

                    const sortedPools = pools.sort((a, b) => Number(b.balance - a.balance));
                    setPoolInfoList(sortedPools);
                }
            }
        } catch (error) {
            console.error("Error fetching pool info:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
            refreshUserProfile();
            fetchScamCoinPool();
            fetchPoolInfo();
    }, [account]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-white mb-4">Pools</h1>
            <p className="text-lg text-gray-400 mb-8">The full list of Base inscriptions</p>

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

            <div className="overflow-hidden rounded-lg border border-purple-600 bg-[#1F1B2D]">
                <table className="w-full text-left">
                    <thead className="bg-[#29263A] text-white">
                    <tr>
                        <th className="px-6 py-3">Rank</th>
                        <th className="px-6 py-3">Pool Coin Name</th>
                        <th className="px-6 py-3">Pool ID</th>
                        <th className="px-6 py-3">Balance</th>
                        <th className="px-6 py-3">Mark Scam</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginatedData.map((pool, index) => (
                        <tr
                            key={pool.poolId}
                            className={`border-t border-t-[#1E1C28] hover:bg-[#444151]`}
                        >
                            <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                            <td className="px-6 py-4">
                                <div className="text-purple-300 font-bold">{pool.name}</div>
                                <div
                                    className="text-sm text-gray-400 cursor-pointer relative group"
                                    onClick={() => copyToClipboard(pool.rawCoinType)}
                                >
                                    <span className="">{`0x${formatCoinType(pool.rawCoinType)}::${pool.name}`}</span>
                                    {copiedPool === pool.rawCoinType && (
                                        <span className="ml-2 text-green-500">☑️</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-400">
                                {truncateAddress(pool.poolId)}
                            </td>
                            <td className="px-6 py-4 text-gray-400">{pool.formattedBalance}</td>
                            <td className="px-6 py-4">
                                {demoNftId ? (
                                    scamCoinMap[pool.rawCoinType] ? (
                                        <AddMarkScam
                                            poolId={pool.poolId}
                                            scamCoinId={scamCoinMap[pool.rawCoinType]}
                                            coinType={pool.rawCoinType}
                                            demoNftId={demoNftId}
                                            onSuccess={refreshUserProfile}
                                        />
                                    ) : (
                                        <MarkScam
                                            poolId={pool.poolId}
                                            coinType={pool.rawCoinType}
                                            demoNftId={demoNftId}
                                            onSuccess={refreshUserProfile}
                                        />
                                    )
                                ) : (
                                    <div>
                                        <button
                                            className="mark-as-scam-button"
                                            onClick={() => setIsModalOpen(true)}
                                        >
                                            Mark as Scam
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

export default Pools;
