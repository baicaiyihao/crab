import { useState } from "react";
import GetTransferDetails from "../pages/GetTransferInfo";
import Getcoininfo from "../pages/Getcoininfo";
import '../styles/dashboard.css'

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('transfer'); // 默认选中的标签

    return (
      <div className="container mx-auto px-4 py-8">
        {/* 导航栏 */}
        <nav className="mb-6">
          <button
            className={`px-4 py-2 mr-2 rounded ${activeTab === "coin" ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setActiveTab("coin")}
          >
            用户信息
          </button>

          <button
            className={`px-4 py-2 mr-2 rounded ${activeTab === "transfer" ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-700"}`}
            onClick={() => setActiveTab("transfer")}
          >
            转账详情
          </button>
        </nav>

        {/* 主体内容 */}
        <div className="grid grid-cols-3 gap-6">
          {/* 根据当前活动标签决定显示的内容 */}
          {activeTab === "transfer" && (
            <div className="col-span-3 bg-[#1F1B2D] p-6 rounded-lg shadow-md">
              <GetTransferDetails />
            </div>
          )}
          {activeTab === "coin" && (
            <div className="col-span-3 bg-[#1F1B2D] p-6 rounded-lg shadow-md">
              <Getcoininfo />
            </div>
          )}
        </div>
      </div>
    );
}