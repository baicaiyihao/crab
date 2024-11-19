import New_pool from "../components/new_pool.tsx";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { getUserProfile } from "../utils";
import { CategorizedObjects, calculateTotalBalance } from "../utils/assetsHelpers.ts";
import { TESTNET_CRAB_PACKAGE_ID, TESTNET_POOLTABLE, TESTNET_TIME, TESTNET_TRANSFERRECORDPOOL } from "../config/constants.ts";
import Deposit from "../components/deposit.tsx";
import { fetchPoolIdForCoin } from "../utils/poolHelpers.ts"; // 导入 helper
import { fetchTokenDecimals } from "../utils/tokenHelpers.ts";
import suiClient from "../cli/suiClient.ts";

const REFRESH_INTERVAL = 3000; // 每 30 秒刷新一次

export default function GetCoinInfo() {
    const account = useCurrentAccount();
    const [userObjects, setUserObjects] = useState<CategorizedObjects | null>(null);
    const [tokenDecimals, setTokenDecimals] = useState<{ [coinType: string]: number }>({});
    const [demoNftId, setDemoNftId] = useState<string | null>(null);
    const [coinPoolMap, setCoinPoolMap] = useState<{ [coinType: string]: string | null }>({});

    async function refreshUserProfile() {
        if (account?.address) {
            try {
                const profile = await getUserProfile(account.address);
                setUserObjects(profile);

                const coinTypes = Object.keys(profile.coins || {});
                for (const coinType of coinTypes) {
                    // 使用 helper 方法获取精度
                    const decimals = await fetchTokenDecimals(suiClient, coinType);
                    setTokenDecimals(prev => ({ ...prev, [coinType]: decimals }));

                    // 检查 poolId 是否存在
                    const poolId = await fetchPoolIdForCoin(TESTNET_POOLTABLE, coinType);
                    setCoinPoolMap(prev => ({ ...prev, [coinType]: poolId }));
                }

                const demoNftObject = Object.entries(profile.objects || {}).find(([objectType]) =>
                  objectType.includes("DemoNFT")
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

    useEffect(() => {
        // 初始加载时获取用户信息
        refreshUserProfile();

        // 设置定时器，每 30 秒刷新一次
        const intervalId = setInterval(refreshUserProfile, REFRESH_INTERVAL);

        // 清理定时器
        return () => clearInterval(intervalId);
    }, [account]);

    const formatTokenBalance = (balance: bigint, decimals: number): string => {
        const integer = balance / BigInt(10 ** decimals);
        const decimal = (balance % BigInt(10 ** decimals)).toString().padStart(decimals, '0');
        return `${integer}.${decimal}`;
    };

    return (
      <div style={{ marginTop: "20px" }}>
          <h3>User Token List</h3>
          {userObjects != null && userObjects.coins && Object.entries(userObjects.coins).length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                <thead>
                <tr>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Token</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Total Balance</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Action</th>
                </tr>
                </thead>
                <tbody>
                {Object.entries(userObjects.coins).map(([coinType, coins], index) => {
                    const coinObjectIds = coins.map(coin => coin.data?.objectId || "N/A");
                    const totalBalance = calculateTotalBalance(coins);

                    const decimals = tokenDecimals[coinType] ?? 9;
                    const formattedBalance = formatTokenBalance(
                      totalBalance.integer * BigInt(10 ** 9) + BigInt(totalBalance.decimal),
                      decimals
                    );
                    const poolId = coinPoolMap[coinType];

                    return (
                      <tr key={index}>
                          <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                              {coinType.split("::").pop()} {/* 提取代币名称 */}
                          </td>
                          <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                              {formattedBalance}
                          </td>
                          <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                              {demoNftId ? (
                                poolId ? (
                                  <Deposit
                                    coinType={coinType}
                                    poolId={poolId}
                                    coinObjects={coinObjectIds}
                                    demoNftId={demoNftId}
                                    transferRecordPoolId={TESTNET_TRANSFERRECORDPOOL}
                                    extraParam={TESTNET_TIME}
                                  />
                                ) : (
                                  <New_pool
                                    crabPackageId={TESTNET_CRAB_PACKAGE_ID}
                                    coinType={coinType}
                                    coinObjects={coinObjectIds}
                                    poolTableId={TESTNET_POOLTABLE}
                                    transferRecordPoolId={TESTNET_TRANSFERRECORDPOOL}
                                    demoNftId={demoNftId}
                                    extraParam={TESTNET_TIME}
                                  />
                                )
                              ) : (
                                <p style={{ color: "red" }}>No DemoNFT found</p>
                              )}
                          </td>
                      </tr>
                    );
                })}
                </tbody>
            </table>
          ) : (
            <p>No tokens found</p>
          )}
      </div>
    );
}