import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useState } from "react";
import Dashboard from "./ui/Dashboard.tsx";
import crabLogo from "./assets/img.png";
import PoolDetails from "./pages/GetPoolInfo.tsx";
import GetUserPoints from "./pages/GetUserPoints.tsx"; // 确保路径正确
import GetScamCoinInfo from "./pages/GetScamCoin.tsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  useCurrentAccount();

  // @ts-ignore
  return (
      <>
        {/* 顶部导航栏 */}
        <header style={headerStyles}>
          <div style={logoContainerStyles}>
            <img
                src={crabLogo}
                alt="Crab Logo"
                style={{
                  height: "60px",
                  objectFit: "contain",
                }}
            />
          </div>
          <nav style={navStyles}>
            <button
                style={activeTab === "Poolinfo" ? activeTabStyles : tabStyles}
                onClick={() => setActiveTab("Poolinfo")}
            >
              Poolinfo
            </button>
            <button
                style={activeTab === "Scamcoin" ? activeTabStyles : tabStyles}
                onClick={() => setActiveTab("Scamcoin")}
            >
              Scamcoin
            </button>
            <button
                style={activeTab === "Userpoint" ? activeTabStyles : tabStyles}
                onClick={() => setActiveTab("Userpoint")}
            >
              Userpoint
            </button>
            <button
                style={activeTab === "Dashboard" ? activeTabStyles : tabStyles}
                onClick={() => setActiveTab("Dashboard")}
            >
              Dashboard
            </button>
            <button
                style={activeTab === "About" ? activeTabStyles : tabStyles}
                onClick={() => setActiveTab("About")}
            >
              About
            </button>
          </nav>
          <div>
            <ConnectButton/>
          </div>
        </header>

        {/* 主内容区 */}
        <main style={mainStyles}>
          {activeTab === "Dashboard" && <Dashboard/>}
          {activeTab === "Poolinfo" && <PoolDetails/>}
          {activeTab === "Scamcoin" && <GetScamCoinInfo />}
          {activeTab === "Userpoint" && <GetUserPoints />}
          {activeTab === "About" && <h2 style={sectionTitleStyles}>About Section</h2>}
        </main>
      </>
  );
}

const headerStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "10px 20px",
  backgroundColor: "#ffffff",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  color: "#333333",
};

const logoContainerStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const navStyles: React.CSSProperties = {
  display: "flex",
  gap: "20px",
};

const tabStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#555555",
  fontSize: "16px",
  cursor: "pointer",
  padding: "5px 10px",
};

const activeTabStyles: React.CSSProperties = {
  ...tabStyles,
  borderBottom: "2px solid #007bff",
  color: "#007bff",
};

const mainStyles: React.CSSProperties = {
  padding: "20px",
};

const sectionTitleStyles: React.CSSProperties = {
  marginBottom: "20px",
  fontSize: "24px",
};
