import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { getUserProfile } from "./index.ts";
import { CategorizedObjects, calculateTotalBalance } from "./utils/assetsHelpers.ts";
import { SuiClient } from "@mysten/sui/client"; // 引入 Sui 客户端

export default function GetCoinInfo() {
    const account = useCurrentAccount();
    const [userObjects, setUserObjects] = useState<CategorizedObjects | null>(null);
    const [tokenDecimals, setTokenDecimals] = useState<{ [coinType: string]: number }>({}); // 动态存储代币精度

    const suiClient = new SuiClient({ url: "https://fullnode.testnet.sui.io/" }); // 初始化 Sui 客户端

    async function fetchTokenDecimals(coinType: string) {
        if (tokenDecimals[coinType] != null) return; // 如果已经获取过精度，直接返回
        try {
            const metadata = await suiClient.getCoinMetadata({ coinType });
            if (metadata && metadata.decimals != null) { // 检查 metadata 是否有效
                setTokenDecimals(prev => ({ ...prev, [coinType]: metadata.decimals }));
            } else {
                console.warn(`No metadata found for ${coinType}, using default decimals.`);
                setTokenDecimals(prev => ({ ...prev, [coinType]: 9 })); // 默认精度
            }
        } catch (error) {
            console.error(`Error fetching metadata for ${coinType}:`, error);
            setTokenDecimals(prev => ({ ...prev, [coinType]: 9 })); // 如果失败，设置默认精度
        }
    }

    async function refreshUserProfile() {
        if (account?.address) {
            try {
                const profile = await getUserProfile(account.address);
                setUserObjects(profile);

                // 获取每种代币的精度
                const coinTypes = Object.keys(profile.coins || {});
                for (const coinType of coinTypes) {
                    fetchTokenDecimals(coinType);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        }
    }

    useEffect(() => {
        refreshUserProfile();
    }, [account]);

    const formatTokenBalance = (balance: bigint, decimals: number): string => {
        const integer = balance / BigInt(10 ** decimals);
        const decimal = (balance % BigInt(10 ** decimals)).toString().padStart(decimals, '0');
        return `${integer}.${decimal}`;
    };

    return (
        <div style={{ marginTop: "20px" }}>
            {userObjects != null ? (
                <div>
                    <div>
                        <h3>Token List</h3>
                        {userObjects.coins && Object.entries(userObjects.coins).length > 0 ? (
                            Object.entries(userObjects.coins).map(([coinType, coins], index) => {
                                const coinObjectIds = coins.map(coin => coin.data?.objectId || "N/A");
                                const totalBalance = calculateTotalBalance(coins);

                                const decimals = tokenDecimals[coinType] ?? 9; // 获取代币精度，默认为 9
                                const formattedBalance = formatTokenBalance(
                                    totalBalance.integer * BigInt(10 ** 9) + BigInt(totalBalance.decimal),
                                    decimals
                                );

                                return (
                                    <div
                                        key={index}
                                        style={{
                                            padding: "10px",
                                            border: "1px solid #ddd",
                                            marginBottom: "10px",
                                        }}
                                    >
                                        <h4>Token Type: {coinType.split("::").pop()}</h4>
                                        <p>Total Balance: {formattedBalance}</p>
                                        <p>Object IDs:</p>
                                        <ul>
                                            {coinObjectIds.map((id, idx) => (
                                                <li key={idx}>{id}</li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })
                        ) : (
                            <p>No tokens found</p>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: "center", marginTop: "50px" }}>
                    <h3>Welcome to Next.js Sui Dapp Template</h3>
                    <h3>Please connect your wallet to view your assets</h3>
                </div>
            )}
        </div>
    );
}
