import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState, useMemo } from "react";
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
    const [copiedAssetType, setCopiedAssetType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

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

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return userTransferDetails.slice(startIndex, startIndex + itemsPerPage);
    }, [userTransferDetails, currentPage, itemsPerPage]);

    const totalPages = useMemo(() => {
        return Math.ceil(userTransferDetails.length / itemsPerPage);
    }, [userTransferDetails, itemsPerPage]);

    useEffect(() => {
        fetchTransferInfo();
    }, [account]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedAssetType(text);
            setTimeout(() => setCopiedAssetType(null), 2000);
        }).catch((error) => {
            console.error('Failed to copy:', error);
        });
    };

    return (
        <div className="mt-8">
            <div className="overflow-hidden rounded-lg bg-[#1F1B2D] border border-purple-600">
                <div className="overflow-x-auto bg-[#1F1B2D] rounded-lg border border-purple-600">
                    <table className="w-full text-left text-white border-collapse">
                        <thead className="bg-[#29263A]">
                        <tr>
                            <th className="px-6 py-3 border-t border-t-[#1E1C28]">#</th>
                            <th className="px-6 py-3 border-t border-t-[#1E1C28]">Token</th>
                            <th className="px-6 py-3 border-t border-t-[#1E1C28]">Amount</th>
                            <th className="px-6 py-3 border-t border-t-[#1E1C28]">Timestamp</th>
                            <th className="px-6 py-3 border-t border-t-[#1E1C28]">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {isLoading ? (
                            // 加载动画
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr key={index} className="bg-[#29263A] border-b animate-pulse">
                                    <td className="px-6 py-3 border-t border-t-[#1E1C28]">
                                        <div className="w-12 h-6 bg-gray-500 rounded-md"></div>
                                    </td>
                                    <td className="px-6 py-3 border-t border-t-[#1E1C28]">
                                        <div className="w-24 h-6 bg-gray-500 rounded-md"></div>
                                    </td>
                                    <td className="px-6 py-3 border-t border-t-[#1E1C28]">
                                        <div className="w-32 h-6 bg-gray-500 rounded-md"></div>
                                    </td>
                                    <td className="px-6 py-3 border-t border-t-[#1E1C28]">
                                        <div className="w-40 h-6 bg-gray-500 rounded-md"></div>
                                    </td>
                                    <td className="px-6 py-3 border-t border-t-[#1E1C28]">
                                        <div className="w-16 h-6 bg-gray-500 rounded-md"></div>
                                    </td>
                                </tr>
                            ))
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((detail) => (
                                <tr key={detail.id} className="hover:bg-[#444151] border-t border-[#1E1C28]">
                                    <td className="px-6 py-4 text-gray-400">{detail.index}</td>
                                    <td className="px-6 py-4 text-gray-400">
                                        <div className="text-purple-300 font-bold">
                                            {detail.assetType}
                                        </div>
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
                <div className="flex items-center">
                    <span className="text-white mr-4">Total: {userTransferDetails.length}</span>
                </div>
                <div className="flex items-center">
                    <button
                        className="px-4 py-2 mx-1 text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    >
                        &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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

export default GetTransferDetails;
