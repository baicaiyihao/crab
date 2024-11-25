import React, { useState, useEffect } from "react";
import logo from "../assets/home/导航logo.png";
import mainElement from "../assets/home/主体元素.png";
import background from "../assets/home/背景.png";
import navbackground from "../assets/home/导航栏背景.png";

const HomePage: React.FC = () => {
    const [selectedMenu, setSelectedMenu] = useState<string>("");
    const [isNarrowScreen, setIsNarrowScreen] = useState<boolean>(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    useEffect(() => {
        const handleResize = () => {
            setIsNarrowScreen(window.innerWidth < 1024);
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // 初始化

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* 背景 */}
            <div
                className="absolute inset-0 -z-10"
                style={{
                    backgroundImage: `url(${background})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                }}
            ></div>

            {/* 导航栏 */}
            <header
                className="fixed top-0 w-full z-10 h-[96px] flex items-center shadow-md"
                style={{
                    backgroundImage: `url(${navbackground})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <nav className="container mx-auto flex items-center justify-between">
                    {/* 左侧 Logo */}
                    <div className="flex items-center">
                        <div
                            className="w-[162px] h-[96px] bg-center bg-cover bg-no-repeat"
                            style={{
                                backgroundImage: `url(${logo})`,
                            }}
                        ></div>
                    </div>

                    {/* 中间菜单 */}
                    {!isNarrowScreen ? (
                        <ul className="flex gap-8">
                            {[
                                { label: "Pools", id: "pools" },
                                { label: "Risk", id: "risk" },
                                { label: "Rewards", id: "rewards" },
                                { label: "Dashboard", id: "dashboard" },
                                { label: "About", id: "about" },
                            ].map((menu, index) => (
                                <li
                                    key={index}
                                    className="relative cursor-pointer"
                                    onClick={() => setSelectedMenu(menu.id)}
                                >
                                    {/* 选中的方框 */}
                                    {selectedMenu === menu.id && (
                                        <div
                                            className="absolute z-[-1]"
                                            style={{
                                                width: `${menu.id.length * 10 + 20}px`,
                                                height: "42px",
                                                top: "-10px",
                                                left: "-13px",
                                                backgroundColor: "#471F50",
                                                borderRadius: "12px",
                                                opacity: 1,
                                                transition: "opacity 0.3s ease",
                                            }}
                                        ></div>
                                    )}
                                    <a
                                        href={`#${menu.id}`}
                                        className="text-[#B57FCA] font-medium text-[16px] leading-[19px] hover:text-[#E5A0FF] transition duration-300"
                                    >
                                        {menu.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : null}

                    {/* 右侧按钮 */}
                    <div className="flex items-center space-x-4">
                        <button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white py-2 px-6 rounded-full shadow-md transition duration-300">
                            Connect Wallet
                        </button>

                        {/* 菜单折叠按钮 */}
                        {isNarrowScreen && (
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="text-white focus:outline-none"
                            >
                                {/* 三条横线图标 */}
                                <div className="flex flex-col space-y-1">
                                    <span className="block w-8 h-1 bg-white"></span>
                                    <span className="block w-8 h-1 bg-white"></span>
                                    <span className="block w-8 h-1 bg-white"></span>
                                </div>
                            </button>
                        )}
                    </div>
                </nav>
            </header>

            {/* 折叠菜单 */}
            {isNarrowScreen && isDropdownOpen && (
                <ul className="absolute top-[96px] right-0 bg-[#471F50] rounded-lg shadow-lg text-white w-[200px]">
                    {[
                        { label: "Pools", id: "pools" },
                        { label: "Risk", id: "risk" },
                        { label: "Rewards", id: "rewards" },
                        { label: "Dashboard", id: "dashboard" },
                        { label: "About", id: "about" },
                    ].map((menu, index) => (
                        <li
                            key={index}
                            className="px-4 py-2 hover:bg-purple-700 cursor-pointer"
                            onClick={() => {
                                setSelectedMenu(menu.id);
                                setIsDropdownOpen(false); // 点击菜单项后关闭折叠菜单
                            }}
                        >
                            <a href={`#${menu.id}`}>{menu.label}</a>
                        </li>
                    ))}
                </ul>
            )}

            {/* 主体内容 */}
            <main className="flex flex-1 flex-col lg:flex-row items-center justify-between px-8 mt-[96px]">
                {/* 左侧文字 */}
                <div className="flex flex-col items-start space-y-6">
                    <h2
                        className="text-4xl lg:text-5xl font-bold leading-tight text-transparent bg-clip-text"
                        style={{
                            backgroundImage: "linear-gradient(90deg, #E3DFF4 0%, #D165FA 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Clear Bad Assets, <br />
                        Unlock a Smarter Digital World
                    </h2>
                    <p className="text-lg text-gray-400">
                        Welcome to Crab – the Next.js Sui Dapp. Connect your wallet to explore your assets.
                    </p>
                    <button
                        className="flex items-start justify-center px-6 py-3 rounded-lg shadow-md font-semibold text-white transition duration-300"
                        style={{
                            minWidth: "140px",
                            height: "50px",
                            background: "linear-gradient(90deg, #9B5EFA 0%, #704BDF 100%)",
                            borderRadius: "12px",
                            textAlign: "center",
                        }}
                    >
                        <span>Claim Your Tokens</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6 ml-2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 4.5l6 6m0 0l-6 6m6-6H4.5"
                            />
                        </svg>
                    </button>
                </div>
                {/* 右侧图片 */}
                <div
                    className="bg-cover bg-center"
                    style={{
                        width: "627px",
                        height: "auto",
                        maxHeight: "100%",
                        backgroundImage: `url(${mainElement})`,
                    }}
                ></div>
            </main>

            {/* Footer */}
            <footer className="bg-purple-900 py-8 w-full">
                <div className="container mx-auto px-8">
                    <div className="flex justify-center space-x-8">
                        <img src="/path/to/asana.png" alt="Asana" className="h-8" />
                        <img src="/path/to/hubspot.png" alt="HubSpot" className="h-8" />
                        <img src="/path/to/stripe.png" alt="Stripe" className="h-8" />
                        <img src="/path/to/webflow.png" alt="Webflow" className="h-8" />
                        <img src="/path/to/mailchimp.png" alt="Mailchimp" className="h-8" />
                        <img src="/path/to/gumroad.png" alt="Gumroad" className="h-8" />
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
