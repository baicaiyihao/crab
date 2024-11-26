import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { TESTNET_USERNFTTABLE } from "../config/constants";
import suiClient from "../cli/suiClient";

export default function GetUserPoints() {
    const account = useCurrentAccount();
    const [userPoints, setUserPoints] = useState<any[]>([]);

    // 钱包地址中间省略显示
    const shortenAddress = (address: string, chars = 6) => {
        return `${address.slice(0, chars)}...${address.slice(-chars)}`;
    };

    // 加载用户积分数据
    async function fetchUserPoints() {
        try {
            // 获取用户NFT表
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

                            // 获取 NFT 数据
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
                                points: Number(points), // 转为数字以便排序
                            };
                        })
                    );

                    // 按积分排序
                    const sortedData = userData.sort((a, b) => b.points - a.points);
                    setUserPoints(sortedData);
                }
            }
        } catch (error) {
            console.error("Error fetching user points:", error);
        }
    }

    useEffect(() => {
        if (account?.address) {
            fetchUserPoints();
        }
    }, [account]);

    return (
        <div style={{textAlign: "center",  marginTop: "20px" }}>
            <h3>User Points Leaderboard</h3>
            {userPoints.length > 0 ? (
                <div style={{textAlign: "center", marginTop: "20px"}}>
                    <table style={{width: "70%", borderCollapse: "collapse", margin: "auto"}}>
                        <thead>
                        <tr>
                            <th style={{border: "1px solid #ddd", padding: "8px"}}>Rank</th>
                            <th style={{border: "1px solid #ddd", padding: "8px"}}>User Address</th>
                            <th style={{border: "1px solid #ddd", padding: "8px"}}>Points</th>
                        </tr>
                        </thead>
                        <tbody>
                        {userPoints.map((user, index) => (
                            <tr key={index}>
                                <td style={{border: "1px solid #ddd", padding: "8px"}}>
                                    {index + 1}
                                </td>
                                <td style={{border: "1px solid #ddd", padding: "8px"}}>
                                    {shortenAddress(user.userAddress)}
                                </td>
                                <td style={{border: "1px solid #ddd", padding: "8px"}}>
                                    {user.points}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                    ) : (
                    <p>No user points data found.</p>
                    )}
                </div>
            );
            }
