import New_pool from "../components/new_pool";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { getUserProfile } from "../utils";
import { CategorizedObjects, calculateTotalBalance } from "../utils/assetsHelpers";
import { TESTNET_CRAB_PACKAGE_ID, TESTNET_POOLTABLE, TESTNET_TIME, TESTNET_TRANSFERRECORDPOOL } from "../config/constants";
import Deposit from "../components/deposit";
import { fetchPoolIdForCoin } from "../utils/poolHelpers"; // 导入 helper
import { fetchTokenDecimals } from "../utils/tokenHelpers";
import suiClient from "../cli/suiClient";

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

    useEffect(() => {
        // 初始加载时获取用户信息
        refreshUserProfile();
    }, [account]);

    const formatTokenBalance = (balance: bigint, decimals: number): string => {
        const integer = balance / BigInt(10 ** decimals);
        const decimal = (balance % BigInt(10 ** decimals)).toString().padStart(decimals, '0');
        return `${integer}.${decimal}`;
    };

    return (
        <div className="mt-8">
            {/* Token List Table */}
            <div className="overflow-hidden rounded-lg bg-[#1F1B2D] border border-purple-600">
                <table className="w-full text-left text-white border-collapse">
                    <thead className="bg-[#29263A]">
                    <tr>
                        <th className="px-6 py-3 border border-gray-700">Token</th>
                        <th className="px-6 py-3 border border-gray-700">Total Balance</th>
                        <th className="px-6 py-3 border border-gray-700">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userObjects != null && userObjects.coins && Object.entries(userObjects.coins).length > 0 ? (
                        Object.entries(userObjects.coins).map(([coinType, coins], index) => {
                            const coinObjectIds = coins.map((coin) => coin.data?.objectId || "N/A");
                            const totalBalance = calculateTotalBalance(coins);

                            const decimals = tokenDecimals[coinType] ?? 9;
                            const formattedBalance = formatTokenBalance(
                                totalBalance.integer * BigInt(10 ** 9) + BigInt(totalBalance.decimal),
                                decimals
                            );
                            const poolId = coinPoolMap[coinType];

                            return (
                                <tr
                                    key={index}
                                    className={`${
                                        index % 2 === 0 ? "bg-[#26223B]" : "bg-[#29263A]"
                                    } border-t border-t-[#1E1C28] hover:bg-[#444151]`}
                                >
                                    <td className="px-6 py-4 border border-gray-700">{coinType.split("::").pop()}</td>
                                    <td className="px-6 py-4 border border-gray-700">{formattedBalance}</td>
                                    <td className="px-6 py-4 border border-gray-700">
                                        {demoNftId ? (
                                            poolId ? (
                                                <Deposit
                                                    coinType={coinType}
                                                    poolId={poolId}
                                                    coinObjects={coinObjectIds}
                                                    demoNftId={demoNftId}
                                                    transferRecordPoolId={TESTNET_TRANSFERRECORDPOOL}
                                                    extraParam={TESTNET_TIME}
                                                    onSuccess={refreshUserProfile}
                                                />
                                            ) : (
                                                <New_pool
                                                    crabPackageId={TESTNET_CRAB_PACKAGE_ID}
                                                    coinType={coinType}
                                                    coinObjects={coinObjectIds}
                                                    poolTableId={TESTNET_POOLTABLE}
                                                    demoNftId={demoNftId}
                                                    transferRecordPoolId={TESTNET_TRANSFERRECORDPOOL}
                                                    extraParam={TESTNET_TIME}
                                                    onSuccess={refreshUserProfile}
                                                />
                                            )
                                        ) : (
                                            <p className="text-red-500">No DemoNFT found</p>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        // Loading skeleton animation
                        Array.from({ length: 5 }).map((_, index) => (
                            <tr key={index} className="bg-[#29263A] border-b animate-pulse">
                                <td className="px-6 py-4 border border-gray-700">
                                    <div className="w-24 h-6 bg-gray-500 rounded-md"></div>
                                </td>
                                <td className="px-6 py-4 border border-gray-700">
                                    <div className="w-32 h-6 bg-gray-500 rounded-md"></div>
                                </td>
                                <td className="px-6 py-4 border border-gray-700">
                                    <div className="w-16 h-6 bg-gray-500 rounded-md"></div>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
