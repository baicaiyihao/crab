import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { TESTNET_SCAMCOINPOOL } from "../config/constants";
import suiClient from "../cli/suiClient";

export default function GetScamCoinInfo() {
    const account = useCurrentAccount();
    const [scamCoinList, setScamCoinList] = useState<any[]>([]);

    // 加载 ScamCoinPool 信息
    async function fetchScamCoinInfo() {
        try {
            // 获取 ScamCoinPool 对象
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

                            // 如果 scamCoinId 是 "Unknown" 或为空，跳过此对象
                            if (!scamCoinId || scamCoinId === "Unknown") {
                                console.warn("Invalid ScamCoin ID, skipping:", scamCoinId);
                                return null;
                            }

                            try {
                                // 查询具体的 ScamCoin 数据
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
                                    name: `0x${cointype}`.split("::").pop(), // 提取代币名称
                                    scamCoinId,
                                    checknum,
                                };
                            } catch (error) {
                                console.error(`Error fetching ScamCoin ID ${scamCoinId}:`, error);
                                return null; // 跳过错误对象
                            }
                        })
                    );

                    // 过滤掉无效结果，并按 checknum 排序
                    const filteredScamCoins = scamCoins.filter((coin) => coin !== null);
                    const sortedScamCoins = filteredScamCoins.sort((a, b) => b.checknum - a.checknum);

                    setScamCoinList(sortedScamCoins);
                }
            }
        } catch (error) {
            console.error("Error fetching ScamCoin info:", error);
        }
    }

    useEffect(() => {
        if (account?.address) {
            fetchScamCoinInfo();
        }
    }, [account]);

    return (
        <div style={{textAlign: "center",  marginTop: "20px" }}>
            <h3>Scam Coin Leaderboard</h3>
            {scamCoinList.length > 0 ? (
                <div style={{textAlign: "center", marginTop: "20px"}}>
                    <table style={{ width: "70%", borderCollapse: "collapse", margin: "auto" }}>
                        <thead>
                        <tr>
                            <th style={{border: "1px solid #ddd", padding: "8px"}}>Rank</th>
                            <th style={{border: "1px solid #ddd", padding: "8px"}}>Scam Coin Name</th>
                            <th style={{border: "1px solid #ddd", padding: "8px"}}>Mark times</th>
                        </tr>
                        </thead>
                        <tbody>
                        {scamCoinList.map((scamCoin, index) => (
                            <tr key={index}>
                                <td style={{border: "1px solid #ddd", padding: "8px"}}>{index + 1}</td>
                                <td style={{border: "1px solid #ddd", padding: "8px"}}>{scamCoin.name}</td>
                                <td style={{border: "1px solid #ddd", padding: "8px"}}>{scamCoin.checknum}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                    ) : (
                    <p>No ScamCoin info found.</p>
                    )}
                </div>
            );
            }
