import { useEffect, useState } from "react";
import GetTransferDetails from "../pages/GetTransferInfo";
import Getcoininfo from "../pages/Getcoininfo";
import suiClient from "../cli/suiClient";
import { fetchPoolInfo } from "../utils/poolService"; // 导入获取池信息的函数
import { TESTNET_SCAMCOINPOOL, TESTNET_POOLTABLE } from "../config/constants"; // 导入常量

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("coinInfo");
    const [, setPools] = useState<any[]>([]); // 存储池数据
    const [overviewData, setOverviewData] = useState<any>(null); // 存储汇总数据
    const [isLoading, setIsLoading] = useState(true); // 添加加载状态

    // 查询数据
    const fetchOverviewData = async () => {
        try {
            setIsLoading(true); // 开始加载时设为 true
            // 使用 Promise.all 批量获取数据
            const [poolData, poolTable, scamCoinPool] = await Promise.all([
                fetchPoolInfo({}),
                suiClient.getObject({ id: TESTNET_POOLTABLE, options: { showContent: true } }),
                suiClient.getObject({ id: TESTNET_SCAMCOINPOOL, options: { showContent: true } }),
            ]);

            // 获取 pool_map 中的池数量
            // @ts-ignore
            const poolCount = poolTable?.data?.content?.fields?.pool_map?.length || 0; // 从 pool_map 获取池数量
            // @ts-ignore
            const scamCount = scamCoinPool?.data?.content?.fields?.ScamCoin_map?.length || 0; // 诈骗币数量

            // 更新 state
            setPools(poolData);
            setOverviewData({
                poolCount,
                scamCount,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false); // 数据加载完毕后设为 false
        }
    };

    useEffect(() => {
        fetchOverviewData(); // 组件加载时调用
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 展示框 */}
            <div className="relative bg-[#0B0218] border border-[#2E2E2E] rounded-2xl w-[766px] h-[150px] mb-6">
                <div className="absolute flex justify-between items-center w-full h-[32px] px-6 top-[22px]">
                    <div className="flex items-center">
                        <span className="font-bold text-white text-2xl">Overview:</span>
                    </div>
                </div>
                {isLoading ? (
                    // 加载动画部分
                    <div className="absolute top-[100px] left-6 flex space-x-32 animate-pulse">
                        <div className="w-32 h-6 bg-gray-500 rounded-md"></div>
                        <div className="w-32 h-6 bg-gray-500 rounded-md"></div>
                    </div>
                ) : (
                    overviewData && (
                        <div className="absolute top-[100px] left-6 flex space-x-32">
                            <h3 className="text-white font-semibold">Total Pools: {overviewData.poolCount}</h3>
                            <h3 className="text-white font-semibold">Total Scam Coins: {overviewData.scamCount}</h3>
                        </div>
                    )
                )}
            </div>

            {/* 标签页导航 */}
            <div className="border border-[#2E2E2E] rounded-xl p-2">
                <div className="flex">
                    <button
                        className={`flex items-center justify-center py-2 px-4 text-lg font-semibold 
                            ${activeTab === "coinInfo" ? "border-2 border-[#D056FF] bg-[#29263A] text-white font-bold rounded-lg" : "border-2 border-[#2E2E2E] text-[#AEAEAE] font-semibold rounded-lg"} 
                            w-40 h-12 mr-4`}
                        onClick={() => setActiveTab("coinInfo")}
                    >
                        Coin List
                    </button>
                    <button
                        className={`flex items-center justify-center py-2 px-4 text-lg font-semibold 
                            ${activeTab === "transferDetails" ? "border-2 border-[#D056FF] bg-[#29263A] text-white font-bold rounded-lg" : "border-2 border-[#2E2E2E] text-[#AEAEAE] font-semibold rounded-lg"} 
                            w-40 h-12`}
                        onClick={() => setActiveTab("transferDetails")}
                    >
                        Trash
                    </button>
                </div>
            </div>

            {/* 主体内容 */}
            <div className="w-full h-[calc(100vh-96px)]">
                {activeTab === "coinInfo" && (
                    <div className="bg-[#29263A] p-6 rounded-lg shadow-md w-full h-full">
                        <Getcoininfo />
                    </div>
                )}
                {activeTab === "transferDetails" && (
                    <div className="bg-[#29263A] p-6 rounded-lg shadow-md w-full h-full">
                        <GetTransferDetails />
                    </div>
                )}
            </div>
        </div>
    );
}
