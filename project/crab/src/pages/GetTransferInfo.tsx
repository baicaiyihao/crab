import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import {
    TESTNET_TRANSFERRECORDPOOL,
    TESTNET_POOLTABLE,
    TESTNET_TIME,
    TESTNET_CRAB_PACKAGE_ID
} from "../config/constants.ts";
import Withdraw from "../components/withdraw.tsx";
import { fetchPoolIdForCoin } from "../utils/poolHelpers.ts";
import { fetchTokenDecimals } from "../utils/tokenHelpers.ts";
import suiClient from "../cli/suiClient.ts";
import { getUserProfile } from "../utils";
import { CategorizedObjects } from "../utils/assetsHelpers.ts";

const REFRESH_INTERVAL = 3000; // 每 3 秒刷新一次

export default function GetTransferDetails() {
    const account = useCurrentAccount();
    const [, setUserObjects] = useState<CategorizedObjects | null>(null);
    const [userTransferDetails, setUserTransferDetails] = useState<any[]>([]);
    const [tokenDecimals, setTokenDecimals] = useState<{ [coinType: string]: number }>({});
    const [demoNftId, setDemoNftId] = useState<string | null>(null);

    // 获取用户的 DemoNFT
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

    // 解析转账记录详细信息
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

    // 获取用户的转账记录
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

                // 过滤未 Claim 的记录
                return transferDetails.filter((detail) => detail.isClaimed === "No");
            }
        }
        return [];
    }

    // 获取并刷新用户数据
    async function fetchTransferInfo() {
        if (!account?.address) {
            console.error("User account not found.");
            return;
        }

        try {
            // 获取用户 Profile 和 Transfer 记录
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
        // 设置定时器，每 30 秒刷新一次
        const intervalId = setInterval(fetchTransferInfo, REFRESH_INTERVAL);

        // 清理定时器
        return () => clearInterval(intervalId);
    }, [account]);

    return (
        <div style={{ marginTop: "20px" }}>
            <h3>User Transfer Details</h3>
            {userTransferDetails.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                    <thead>
                    <tr>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Token</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Amount</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Timestamp</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userTransferDetails.map((transfer, index) => (
                        <tr key={index}>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                {transfer.assetType}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                {transfer.amount}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                {transfer.timestamp}
                            </td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                {demoNftId ? (
                                    transfer.poolId ? (
                                        <Withdraw
                                            transferInRecordObject={transfer.id}
                                            coinType={transfer.fullAssetType}
                                            transferRecordPoolId={transfer.poolId}
                                            demoNftId={demoNftId}
                                            extraParam={TESTNET_TIME}
                                            onSuccess={fetchTransferInfo} // 传递刷新函数
                                        />
                                    ) : (
                                        <p style={{ color: "red" }}>No Pool Found</p>
                                    )
                                ) : (
                                    <p style={{ color: "red" }}>No DemoNFT found</p>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>No transfer records found for this user.</p>
            )}
        </div>
    );
}
