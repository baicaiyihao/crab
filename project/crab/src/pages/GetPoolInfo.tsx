import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { TESTNET_POOLTABLE, TESTNET_CRAB_PACKAGE_ID, TESTNET_SCAMCOINPOOL } from "../config/constants";
import { fetchTokenDecimals } from "../utils/tokenHelpers";
import suiClient from "../cli/suiClient";
import MarkScam from "../components/new_mark_scam";
import AddMarkScam from "../components/add_mark_scam"; // 引入 AddMarkScam
import { getUserProfile } from "../utils";

export default function GetPoolInfo() {
    const account = useCurrentAccount();
    const [poolInfoList, setPoolInfoList] = useState<any[]>([]);
    const [tokenDecimals, setTokenDecimals] = useState<{ [coinType: string]: number }>({});
    const [demoNftId, setDemoNftId] = useState<string | null>(null);
    const [scamCoinMap, setScamCoinMap] = useState<{ [coinType: string]: string }>({}); // 存储 coinType 到 scamCoinId 的映射

    const formatTokenBalance = (balance: bigint, decimals: number): string => {
        const integer = balance / BigInt(10 ** decimals);
        const decimal = (balance % BigInt(10 ** decimals)).toString().padStart(decimals, '0');
        return `${integer}.${decimal}`;
    };

    const truncateAddress = (address: string): string => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    async function refreshUserProfile() {
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
    }

    async function fetchScamCoinPool() {
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
    }

    async function fetchPoolInfo() {
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
                                    decimals = decimals ?? 9; // 默认精度为 9
                                } catch (error) {
                                    console.error(`Error fetching decimals for ${coinType}:`, error);
                                    decimals = 9; // 设置默认精度
                                }
                                setTokenDecimals(prev => ({ ...prev, [coinType]: decimals }));
                            }

                            return {
                                name: coinType.split("::").pop(),
                                poolId: truncateAddress(poolId),
                                balance,
                                formattedBalance: formatTokenBalance(balance, decimals),
                                rawPoolId: poolId,
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
        }
    }

    useEffect(() => {
        if (account?.address) {
            refreshUserProfile();
            fetchScamCoinPool(); // 获取 ScamCoinPool 数据
            fetchPoolInfo();
        }
    }, [account]);

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <h3>Pool Leaderboard</h3>
            {poolInfoList.length > 0 ? (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <table style={{ width: "70%", borderCollapse: "collapse", margin: "auto" }}>
                        <thead>
                        <tr>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Rank</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Pool Coin Name</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Pool ID</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Balance</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {poolInfoList.map((pool, index) => (
                            <tr key={index}>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{index + 1}</td>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{pool.name}</td>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{pool.poolId}</td>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{pool.formattedBalance}</td>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    {demoNftId ? (
                                        scamCoinMap[pool.rawCoinType] ? (
                                            <AddMarkScam
                                                poolId={pool.rawPoolId}
                                                scamCoinId={scamCoinMap[pool.rawCoinType]}
                                                coinType={pool.rawCoinType}
                                                demoNftId={demoNftId}
                                                onSuccess={fetchPoolInfo}
                                            />
                                        ) : (
                                            <MarkScam
                                                poolId={pool.rawPoolId}
                                                coinType={pool.rawCoinType}
                                                demoNftId={demoNftId}
                                                onSuccess={fetchPoolInfo}
                                            />
                                        )
                                    ) : (
                                        <p style={{ color: "red" }}>No DemoNFT found</p>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No pool info found.</p>
            )}
        </div>
    );
}
