import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { TESTNET_POOLTABLE, TESTNET_CRAB_PACKAGE_ID } from "../config/constants.ts";
import { fetchTokenDecimals } from "../utils/tokenHelpers.ts";
import suiClient from "../cli/suiClient.ts";
import MarkScam from "../components/new_mark_scam.tsx";
import { getUserProfile } from "../utils";

export default function GetPoolInfo() {
    const account = useCurrentAccount();
    const [poolInfoList, setPoolInfoList] = useState<any[]>([]);
    const [tokenDecimals, setTokenDecimals] = useState<{ [coinType: string]: number }>({});
    const [demoNftId, setDemoNftId] = useState<string | null>(null);

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

    // 加载池信息
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
                            const coinType = `0x${rawName}`;
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
                                rawPoolId: poolId, // 保存完整的 poolId
                                rawCoinType: coinType, // 保存完整的 coinType
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
            refreshUserProfile(); // 加载用户信息，包括 demoNftId
            fetchPoolInfo(); // 加载池信息
        }
    }, [account]);

    return (
        <div style={{ marginTop: "20px" }}>
            <h3>Pool Info</h3>
            {poolInfoList.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
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
                                    <MarkScam
                                        poolId={pool.rawPoolId}
                                        coinType={pool.name}
                                        demoNftId={demoNftId}
                                        onSuccess={fetchPoolInfo} // 成功后刷新池信息
                                    />
                                ) : (
                                    <p style={{ color: "red" }}>No DemoNFT found</p>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>No pool info found.</p>
            )}
        </div>
    );
}
