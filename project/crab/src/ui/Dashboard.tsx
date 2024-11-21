import { useState } from "react";
import Getuserinfo from "../pages/Getuserinfo.tsx";
import GetTransferDetails from "../pages/GetTransferInfo.tsx";
import Getcoininfo from "../pages/Getcoininfo.tsx";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("Coin Info"); // 当前显示的内容，默认为 "Coin Info"

    return (
        <div style={dashboardStyles}>
            {/* 顶部标签导航 */}
            <div style={tabsContainerStyles}>
                <button
                    style={activeTab === "Coin Info" ? activeTabButtonStyles : tabButtonStyles}
                    onClick={() => setActiveTab("Coin Info")}
                >
                    Coin Info
                </button>
                <button
                    style={activeTab === "Transfer Info" ? activeTabButtonStyles : tabButtonStyles}
                    onClick={() => setActiveTab("Transfer Info")}
                >
                    Transfer Info
                </button>
            </div>

            {/* 左侧主要内容，根据 activeTab 显示 */}
            <div style={mainAreaStyles}>
                {activeTab === "Coin Info" && <Getcoininfo />}
                {activeTab === "Transfer Info" && <GetTransferDetails />}
            </div>

            {/* 右侧用户信息 */}
            <div style={userInfoStyles}>
                <Getuserinfo />
            </div>
        </div>
    );
}

const dashboardStyles: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr", // 左右布局比例
    gridGap: "20px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    alignItems: "start", // 保证内容顶部对齐
    minHeight: "calc(100vh - 60px)", // 减去导航栏高度
};

const tabsContainerStyles: React.CSSProperties = {
    gridColumn: "1 / span 2", // 跨越两列
    display: "flex",
    gap: "10px",
    justifyContent: "flex-start", // 按钮靠左对齐
    marginBottom: "10px", // 减少按钮与内容之间的间距
};

const tabButtonStyles: React.CSSProperties = {
    padding: "8px 16px", // 调整内边距使按钮更紧凑
    height: "38px", // 调整按钮高度
    border: "1px solid #ddd",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
    borderRadius: "5px",
    display: "flex",
    alignItems: "center", // 确保按钮文本垂直居中
    justifyContent: "center", // 确保按钮文本水平居中
};

const activeTabButtonStyles: React.CSSProperties = {
    ...tabButtonStyles,
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "1px solid #007bff",
};

const mainAreaStyles: React.CSSProperties = {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    marginTop: "-300px", // 缩小与按钮之间的距离
};

const userInfoStyles: React.CSSProperties = {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    marginTop: "-300px", // 缩小与主内容的顶部间距
};
