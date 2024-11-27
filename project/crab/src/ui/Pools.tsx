import React, { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { TESTNET_POOLTABLE, TESTNET_CRAB_PACKAGE_ID, TESTNET_SCAMCOINPOOL } from "../config/constants";
import { fetchTokenDecimals } from "../utils/tokenHelpers";
import suiClient from "../cli/suiClient";
import MarkScam from "../components/new_mark_scam";
import AddMarkScam from "../components/add_mark_scam";
import { getUserProfile } from "../utils";

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div
                className="w-16 h-16 border-4 border-purple-600 border-t-transparent border-solid rounded-full animate-spin"></div>
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

    const formatTokenBalance = (balance: bigint, decimals: number): string => {
        const integer = balance / BigInt(10 ** decimals);
        const decimal = (balance % BigInt(10 ** decimals)).toString().padStart(decimals, '0');
        return `${integer}.${decimal.slice(0, 2)}`; // 默认保留两位小数
    };

    const truncateAddress = (address: string): string => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert("Copied to clipboard!");
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
        if (account?.address) {
            refreshUserProfile();
            fetchScamCoinPool();
            fetchPoolInfo();
        }
    }, [account]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-white mb-4">Pools</h1>
            <p className="text-lg text-gray-400 mb-8">The full list of Base inscriptions</p>

            <div className="overflow-hidden rounded-lg border border-purple-600 bg-[#1F1B2D]">
                <table className="w-full text-left">
                    <thead className="bg-[#29263A] text-white">
                    <tr>
                        <th className="px-6 py-3">Rank</th>
                        <th className="px-6 py-3">Pool Coin Name</th>
                        <th className="px-6 py-3">Pool ID</th>
                        <th className="px-6 py-3">Balance</th>
                        <th className="px-6 py-3">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {poolInfoList.map((pool, index) => (
                        <tr
                            key={index}
                            className={`text-white ${
                                index % 2 === 0 ? "bg-[#26223B]" : "bg-[#29263A]"
                            }`}
                        >
                            <td className="px-6 py-4">{index + 1}</td>
                            <td className="px-6 py-4">{pool.name}</td>
                            <td
                                className="px-6 py-4 cursor-pointer hover:underline"
                                onClick={() => copyToClipboard(pool.poolId)}
                                title="Click to copy"
                            >
                                {truncateAddress(pool.poolId)}
                            </td>
                            <td className="px-6 py-4">{pool.formattedBalance}</td>
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
                                    <p className="text-red-500">No DemoNFT found</p>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Pools;
