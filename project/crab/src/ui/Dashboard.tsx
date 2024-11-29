import { useState } from "react";
import GetTransferDetails from "../pages/GetTransferInfo";
import Getcoininfo from "../pages/Getcoininfo";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("coinInfo"); // 控制当前选中的标签

    return (
        <div className="container mx-auto px-4 py-8">

            {/* 使用 flex 布局将展示框放在上面，标签页放在下面 */}
            <div className="flex flex-col mb-6">

                {/* 展示框，放置在上面 */}
                <div className="relative bg-[#0B0218] border border-[#2E2E2E] rounded-2xl w-[766px] h-[120px] mb-6">
                    {/* 内部内容 */}
                    <div className="absolute flex justify-between items-center w-full h-[32px] px-6 top-[22px]">
                        <div className="flex items-center">
                            <span className="font-bold text-white text-2xl">NTVCrypto Design System</span>
                            <div className="w-[10px] h-[10px] bg-[#9E20CF] transform rotate-45 ml-2"></div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-[#D056FF] text-sm">Some Info</span>
                            <span className="border border-[#D056FF] w-5 h-5 rounded-sm transform rotate-90 ml-2"></span>
                        </div>
                    </div>

                    {/* 中间部分内容 */}
                    <div className="absolute flex justify-between items-center w-full h-[32px] px-6 top-[66px]">
                        <div className="flex items-center">
                            <span className="text-[#AEAEAE] text-sm">Some Info 1</span>
                            <span className="font-bold text-white text-sm ml-2">Content 1</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-[#AEAEAE] text-sm">Some Info 2</span>
                            <span className="font-bold text-white text-sm ml-2">Content 2</span>
                        </div>
                        <div className="flex items-center">
                            <span className="text-[#AEAEAE] text-sm">Some Info 3</span>
                            <span className="font-bold text-white text-sm ml-2">Content 3</span>
                        </div>
                    </div>
                </div>

                {/* 标签页导航，放置在下面 */}
                <div className="border border-[#2E2E2E] rounded-xl p-2"> {/* 外框 */}
                    <div className="flex">
                        {/* Coin Info Tab */}
                        <button
                            className={`flex items-center justify-center py-2 px-4 text-lg font-semibold 
                                ${activeTab === "coinInfo"
                                ? "border-2 border-[#D056FF] bg-[#29263A] text-white font-bold rounded-lg"
                                : "border-2 border-[#2E2E2E] text-[#AEAEAE] font-semibold rounded-lg"} 
                                w-40 h-12 mr-4`}  // 添加间距
                            onClick={() => setActiveTab("coinInfo")}
                            style={{
                                borderBottom: activeTab === "coinInfo" ? "3px solid #D056FF" : "none",
                            }}
                        >
                            Coin List
                        </button>
                        {/* Transfer Details Tab */}
                        <button
                            className={`flex items-center justify-center py-2 px-4 text-lg font-semibold 
                                ${activeTab === "transferDetails"
                                ? "border-2 border-[#D056FF] bg-[#29263A] text-white font-bold rounded-lg"
                                : "border-2 border-[#2E2E2E] text-[#AEAEAE] font-semibold rounded-lg"} 
                                w-40 h-12`}
                            onClick={() => setActiveTab("transferDetails")}
                            style={{
                                borderBottom: activeTab === "transferDetails" ? "3px solid #D056FF" : "none",
                            }}
                        >
                            Trash
                        </button>
                    </div>
                </div>

            </div>

            {/* 主体内容 */}
            <div className="w-full h-[calc(100vh-96px)]"> {/* 设置内容区域占满视口 */}
                {activeTab === "coinInfo" && (
                    <div className="bg-[#29263A] p-6 rounded-lg shadow-md w-full h-full">
                        {/* 新增的英文内容 */}
                        <div className="mb-4 text-[#AEAEAE] font-medium text-lg">
                            Please select the token you want to recycle.
                        </div>
                        <Getcoininfo />
                    </div>
                )}
                {/* 根据选中的标签展示不同内容 */}
                {activeTab === "transferDetails" && (
                    <div className="bg-[#29263A] p-6 rounded-lg shadow-md w-full h-full">
                        {/* 新增的英文内容 */}
                        <div className="mb-4 text-[#AEAEAE] font-medium text-lg">
                            You can retrieve your tokens within 30 days.
                        </div>
                        <GetTransferDetails />
                    </div>
                )}


            </div>

        </div>
    );
}
