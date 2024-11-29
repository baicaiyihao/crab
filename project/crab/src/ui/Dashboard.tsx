import { useState } from "react";
import GetTransferDetails from "../pages/GetTransferInfo";
import Getcoininfo from "../pages/Getcoininfo";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("transferDetails"); // 控制当前选中的标签

    return (
        <div className="container mx-auto px-4 py-8">

            {/* 标签页导航 */}
            <div className="flex border-b border-gray-700 mb-6">
                <button
                    className={`py-2 px-4 text-lg font-semibold ${activeTab === "transferDetails" ? "border-b-2 border-[#4C6CFF]" : "text-gray-400"}`}
                    onClick={() => setActiveTab("transferDetails")}
                >
                    Transfer Details
                </button>
                <button
                    className={`py-2 px-4 text-lg font-semibold ${activeTab === "coinInfo" ? "border-b-2 border-[#4C6CFF]" : "text-gray-400"}`}
                    onClick={() => setActiveTab("coinInfo")}
                >
                    Coin Info
                </button>
            </div>

            {/* 主体内容 */}
            <div className="w-full h-[calc(100vh-96px)]"> {/* 设置内容区域占满视口 */}
                {/* 根据选中的标签展示不同内容 */}
                {activeTab === "transferDetails" && (
                    <div className="bg-[#29263A] p-6 rounded-lg shadow-md w-full h-full">
                        <GetTransferDetails />
                    </div>
                )}

                {activeTab === "coinInfo" && (
                    <div className="bg-[#29263A] p-6 rounded-lg shadow-md w-full h-full">
                        <Getcoininfo />
                    </div>
                )}
            </div>

        </div>
    );
}
