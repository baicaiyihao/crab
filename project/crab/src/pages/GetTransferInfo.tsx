import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import {
    TESTNET_TRANSFERRECORDPOOL,
    TESTNET_POOLTABLE,
    TESTNET_TIME,
    TESTNET_CRAB_PACKAGE_ID
} from "../config/constants";
import Withdraw from "../components/withdraw";
import { fetchPoolIdForCoin } from "../utils/poolHelpers";
import { fetchTokenDecimals } from "../utils/tokenHelpers";
import suiClient from "../cli/suiClient";
import { getUserProfile } from "../utils";
import { CategorizedObjects } from "../utils/assetsHelpers";

const GetTransferDetails = () => {
    const account = useCurrentAccount();
    const [, setUserObjects] = useState<CategorizedObjects | null>(null);
    const [userTransferDetails, setUserTransferDetails] = useState<any[]>([]);
    const [tokenDecimals, setTokenDecimals] = useState<{ [coinType: string]: number }>({});
    const [demoNftId, setDemoNftId] = useState<string | null>(null);
    const [copiedAssetType, setCopiedAssetType] = useState<string | null>(null); // 用于存储复制的 assetType
    const [isLoading, setIsLoading] = useState<boolean>(true); // 新增加载状态

    const formatCoinType = (coinType: string): string => {
        if (coinType.length > 20) {
            return `${coinType.slice(0, 6)}...${coinType.slice(-4)}`;
        }
        return coinType;
    };
    async function fetchDemoNFT(profile: CategorizedObjects) {
        const demoNftObject = Object.entries(profile.objects || {}).find(([objectType]) =>
            objectType.includes(`${TESTNET_CRAB_PACKAGE_ID}::demo::DemoNFT`)
        );
        if (demoNftObject) {
            const demoNftInstances = demoNftObject[1];
            return Array.isArray(demoNftInstances) && demoNftInstances.length > 0
                ? demoNftInstances[0]?.data?.objectId || null
                : null;
        }
        return null;
    }

    async function parseTransferDetails(detail: any) {
        const fields = detail?.data?.content?.fields || {};
        const amountRaw = fields?.amount || "0";
        const fullAssetType = `0x${fields?.asset_type?.fields?.name || "Unknown"}`;
        const assetType = fullAssetType.split("::").pop() || "Unknown";
        const isClaimed = fields?.is_claimed === "1" ? "Yes" : "No";
        const timestamp = new Date(parseInt(fields?.timestamp || "0", 10)).toLocaleString();

        let decimals = tokenDecimals[fullAssetType];
        if (decimals == null) {
            decimals = await fetchTokenDecimals(suiClient, fullAssetType);
            setTokenDecimals(prev => ({ ...prev, [fullAssetType]: decimals }));
        }

        const amount = parseFloat(amountRaw) / Math.pow(10, decimals);

        return {
            id: fields?.id?.id || "Unknown",
            amount,
            assetType,
            isClaimed,
            timestamp,
            fullAssetType,
        };
    }

    async function fetchTransferRecords() {
        const transferPool = await suiClient.getObject({
            id: TESTNET_TRANSFERRECORDPOOL,
            options: { showContent: true },
        });
        const content = transferPool?.data?.content;

        if (
            content?.dataType === "moveObject" &&
            (content as any)?.fields?.records_map
        ) {
            const recordsMap = (content as any).fields.records_map;

            if (Array.isArray(recordsMap)) {
                const userRecords = recordsMap.filter(
                    (record) => record?.fields?.users_address === account?.address
                );
                const transferObjects = userRecords.map(
                    (record) => record?.fields?.transferInRecord_object
                );

                const transferDetails = await Promise.all(
                    transferObjects.map(async (id: string) => {
                        const detail = await suiClient.getObject({
                            id,
                            options: { showContent: true },
                        });
                        const parsedDetail = await parseTransferDetails(detail);
                        const poolId = await fetchPoolIdForCoin(TESTNET_POOLTABLE, parsedDetail.fullAssetType);
                        return { ...parsedDetail, poolId };
                    })
                );

                // Sort by timestamp, earliest first
                const sortedTransferDetails = transferDetails.sort((a, b) => {
                    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                });

                // Add index to each item
                return sortedTransferDetails.filter((detail) => detail.isClaimed === "No").map((detail, index) => ({
                    ...detail,
                    index: index + 1, // Adding 1-based index
                }));
            }
        }
        return [];
    }

    async function fetchTransferInfo() {
        if (!account?.address) {
            console.error("User account not found.");
            return;
        }

        try {
            setIsLoading(true); // 开始加载时设置为 true

            const profile = await getUserProfile(account.address);
            setUserObjects(profile);

            const nftId = await fetchDemoNFT(profile);
            setDemoNftId(nftId);

            const transferDetails = await fetchTransferRecords();
            setUserTransferDetails(transferDetails);

            console.log("User Transfer Details (Unclaimed):", transferDetails);
        } catch (error) {
            console.error("Error fetching transfer info:", error);
        } finally {
            setIsLoading(false); // 无论请求成功或失败，都要将 isLoading 设置为 false
        }
    }

    useEffect(() => {
        fetchTransferInfo();
    }, [account]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedAssetType(text);
            setTimeout(() => setCopiedAssetType(null), 2000); // 2秒后恢复状态
        }).catch((error) => {
            console.error('Failed to copy:', error);
        });
    };

    return (
        <div className="mt-8">
            <div className="overflow-hidden rounded-lg bg-[#1F1B2D] border border-purple-600">
                {/* 主要内容区域 */}
                <div className="overflow-x-auto bg-[#29263A] rounded-lg border border-[#2E2E2E]">
                    <table className="min-w-full table-auto text-left text-white border-collapse">
                        <thead className="bg-[#29263A]">
                        <tr>
                            <th className="px-6 py-3 border border-gray-700">#</th> {/* 排序序号 */}
                            <th className="px-6 py-3 border border-gray-700">Token</th>
                            <th className="px-6 py-3 border border-gray-700">Amount</th>
                            <th className="px-6 py-3 border border-gray-700">Timestamp</th>
                            <th className="px-6 py-3 border border-gray-700">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {isLoading ? (
                            // 加载动画
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr key={index} className="bg-[#29263A] border-b animate-pulse">
                                    <td className="px-6 py-4 border border-gray-700">
                                        <div className="w-12 h-6 bg-gray-500 rounded-md"></div>
                                    </td>
                                    <td className="px-6 py-4 border border-gray-700">
                                        <div className="w-24 h-6 bg-gray-500 rounded-md"></div>
                                    </td>
                                    <td className="px-6 py-4 border border-gray-700">
                                        <div className="w-32 h-6 bg-gray-500 rounded-md"></div>
                                    </td>
                                    <td className="px-6 py-4 border border-gray-700">
                                        <div className="w-40 h-6 bg-gray-500 rounded-md"></div>
                                    </td>
                                    <td className="px-6 py-4 border border-gray-700">
                                        <div className="w-16 h-6 bg-gray-500 rounded-md"></div>
                                    </td>
                                </tr>
                            ))
                        ) : userTransferDetails.length > 0 ? (
                            userTransferDetails.map((detail) => (
                                <tr key={detail.id} className="hover:bg-[#444151] border-t border-[#1E1C28]">
                                    <td className="px-6 py-4 text-gray-400">{detail.index}</td> {/* 显示排序序号 */}
                                    <td className="px-6 py-4 text-gray-400">
                                        <div className="text-purple-300 font-bold">{detail.assetType}</div>
                                        <div
                                            className="text-sm text-gray-400 cursor-pointer relative group"
                                            onClick={() => handleCopy(detail.fullAssetType)}
                                        >
                                            <span className="">{`0x${formatCoinType(detail.fullAssetType)}`}</span>
                                            {copiedAssetType === detail.fullAssetType && (
                                                <span className="ml-2 text-green-500">☑️</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{detail.amount}</td>
                                    <td className="px-6 py-4 text-gray-400">{detail.timestamp}</td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {demoNftId ? (
                                            detail.poolId ? (
                                                <Withdraw
                                                    transferInRecordObject={detail.id}
                                                    coinType={detail.fullAssetType}
                                                    transferRecordPoolId={detail.poolId}
                                                    demoNftId={demoNftId}
                                                    extraParam={TESTNET_TIME}
                                                    onSuccess={fetchTransferInfo}
                                                />
                                            ) : (
                                                <p className="text-red-500">No Pool Found</p>
                                            )
                                        ) : (
                                            <p className="text-red-500">No DemoNFT found</p>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    No transfer records found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

};

export default GetTransferDetails;
