import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import { getUserProfile } from "./index.ts";
import { CategorizedObjects } from "./utils/assetsHelpers.ts";
import CreateNFT from "./components/CreateNFT.tsx";

export default function Getuserinfo() {
    const account = useCurrentAccount();
    const [userObjects, setUserObjects] = useState<CategorizedObjects | null>(null);
    const [hasDemoNFT, setHasDemoNFT] = useState(false);
    const [demoNFTData, setDemoNFTData] = useState<any | null>(null);

    // 定义刷新用户资料的函数
    async function refreshUserProfile() {
        if (account?.address) {
            try {
                const profile = await getUserProfile(account.address);
                setUserObjects(profile);

                // 检查是否存在 DemoNFT 对象
                const demoNFT = Object.entries(profile.objects || {}).find(
                    ([objectType]) => objectType.includes("DemoNFT")
                );

                if (demoNFT) {
                    setHasDemoNFT(true);
                    setDemoNFTData(demoNFT[1]); // 提取 DemoNFT 数据
                } else {
                    setHasDemoNFT(false);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        }
    }

    useEffect(() => {
        refreshUserProfile(); // 初次加载时获取用户信息
    }, [account]);

    return (
        <div style={{ marginTop: "20px" }}>
            {userObjects != null ? (
                <div>
                    {hasDemoNFT ? (
                        <div>
                            <h3>User info</h3>
                            {Array.isArray(demoNFTData) && demoNFTData.length > 0 ? (
                                demoNFTData.map((nft, index) => {
                                    const fields = nft?.data?.content?.fields;
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                padding: "10px",
                                                border: "1px solid #ddd",
                                                marginBottom: "10px",
                                            }}
                                        >
                                            <p>Points: {fields?.users_points || "N/A"}</p>
                                            <p>User ID: {fields?.userid || "N/A"}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <p>No valid DemoNFT data found</p>
                            )}
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", marginTop: "50px" }}>
                            <h3>No DemoNFT Found</h3>
                            {/* 将刷新函数传递给 CreateNFT */}
                            <CreateNFT onSuccess={refreshUserProfile} />
                        </div>
                    )}
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
