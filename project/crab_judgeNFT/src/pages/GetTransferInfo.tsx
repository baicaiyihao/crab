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

export default function GetTransferDetails() {
    const account = useCurrentAccount();
    const [, setUserObjects] = useState<CategorizedObjects | null>(null);
    const [userTransferDetails, setUserTransferDetails] = useState<any[]>([]);
    const [tokenDecimals, setTokenDecimals] = useState<{ [coinType: string]: number }>({});
    const [demoNftId, setDemoNftId] = useState<string | null>(null);

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

                return transferDetails.filter((detail) => detail.isClaimed === "No");
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
            const profile = await getUserProfile(account.address);
            setUserObjects(profile);

            const nftId = await fetchDemoNFT(profile);
            setDemoNftId(nftId);

            const transferDetails = await fetchTransferRecords();
            setUserTransferDetails(transferDetails);

            console.log("User Transfer Details (Unclaimed):", transferDetails);
        } catch (error) {
            console.error("Error fetching transfer info:", error);
        }
    }

    useEffect(() => {
        fetchTransferInfo();
    }, [account]);

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold text-white mb-4">User Transfer Details</h3>
            {userTransferDetails.length > 0 ? (
                <table className="w-full table-auto text-left text-white border-collapse">
                    <thead className="bg-[#29263A]">
                    <tr>
                        <th className="px-6 py-3 border border-gray-700">Token</th>
                        <th className="px-6 py-3 border border-gray-700">Amount</th>
                        <th className="px-6 py-3 border border-gray-700">Timestamp</th>
                        <th className="px-6 py-3 border border-gray-700">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userTransferDetails.map((transfer, index) => (
                        <tr
                            key={index}
                            className={`${
                                index % 2 === 0 ? "bg-[#26223B]" : "bg-[#29263A]"
                            } border-b`}
                        >
                            <td className="px-6 py-4 border border-gray-700">{transfer.assetType}</td>
                            <td className="px-6 py-4 border border-gray-700">{transfer.amount}</td>
                            <td className="px-6 py-4 border border-gray-700">{transfer.timestamp}</td>
                            <td className="px-6 py-4 border border-gray-700">
                                {demoNftId ? (
                                    transfer.poolId ? (
                                        <Withdraw
                                            transferInRecordObject={transfer.id}
                                            coinType={transfer.fullAssetType}
                                            transferRecordPoolId={transfer.poolId}
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
                    ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-gray-400">No transfer records found for this user.</p>
            )}
        </div>
    );
}
