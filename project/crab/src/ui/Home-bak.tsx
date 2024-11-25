import React, { useState } from "react";
import logo from "../assets/home/导航logo.png";
import mainElement from "../assets/home/主体元素.png";
import background from "../assets/home/背景.png";
import navbackground from "../assets/home/导航栏背景.png";

const HomePage: React.FC = () => {
    const [selectedMenu, setSelectedMenu] = useState<string>("");

    return (
        <div className="flex flex-col min-h-screen">
            {/* 背景 */}
            <div
                className="absolute inset-0 -z-10 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${background})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            ></div>

            {/* 导航栏 */}
            <header
                className="fixed top-0 w-full z-10 shadow-md h-[96px] flex items-center"
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
                    <ul
                        className="flex items-center justify-center gap-[35px]"
                        style={{
                            width: "409px",
                            height: "19px",
                            position: "absolute",
                            left: "calc(50% - 409px/2 - 236.5px)",
                            top: "39.5px",
                        }}
                    >
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
                                            width: `${menu.id.length * 10 + 20}px`, //自动获取长度
                                            height: "42px",
                                            top: "-10px",
                                            left: "-13px", // 调整使其包裹菜单项
                                            backgroundColor: "#471F50",
                                            borderRadius: "12px", // 实现四角圆弧
                                            opacity: 1,
                                            transition: "opacity 0.3s ease",
                                        }}
                                    ></div>
                                )}
                                <a
                                    href={`#${menu.id}`}
                                    className="text-[#B57FCA] font-medium text-[16px] leading-[19px] text-center tracking-[-0.01em] hover:text-[#E5A0FF] transition duration-300"
                                >
                                    {menu.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* 右侧按钮 */}
                    <div className="flex items-center space-x-4">
                        <button
                            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white py-2 px-6 rounded-full shadow-md transition duration-300">
                            Connect Wallet
                        </button>
                    </div>
                </nav>
            </header>

            {/* 主体内容 */}
            <main className="flex-1 flex flex-col lg:flex-row items-center justify-between px-8 mt-[96px]"
                  style={{
                      minHeight: "calc(100vh - 68px)", // 视口高度减去导航栏和Footer高度
                  }}>
                {/* 左侧文字 */}
                <div
                    className="flex flex-col justify-center items-start space-y-6"
                    style={{
                        position: "absolute",
                        width: "879px", // 与设计稿一致
                        height: "247px",
                        left: "calc(50% - 879px/2 - 225.5px)", // 居中并偏移
                        top: "288px", // 根据设计稿高度调整
                    }}
                >
                    <h2
                        className="text-4xl lg:text-5xl font-bold leading-tight text-transparent bg-clip-text"
                        style={{
                            backgroundImage: "linear-gradient(90deg, #E3DFF4 0%, #D165FA 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            width: "961px", // 与设计稿保持一致
                            height: "114px",
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 700,
                            fontSize: "52px",
                            lineHeight: "110%", // 保持行高与设计一致
                        }}
                    >
                        Clear Bad Assets, <br/>
                        Unlock a Smarter Digital World
                    </h2>
                    <p
                        className="text-lg text-gray-400"
                        style={{
                            width: "879px", // 与设计稿一致
                            height: "27px",
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 400,
                            fontSize: "18px",
                            lineHeight: "150%", // 行高
                            color: "#AD78C1",
                        }}
                    >
                        Welcome to Crab – the Next.js Sui Dapp. Connect your wallet to explore your assets.
                    </p>
                    <button
                        className="flex items-center justify-between px-6 py-3 rounded-lg shadow-md"
                        style={{
                            width: "auto", // 自动适配内容宽度
                            minWidth: "212px", // 最小宽度确保按钮不太窄
                            height: "100px", // 固定高度
                            background: "linear-gradient(270deg, #96519F -89.86%, rgba(150, 81, 159, 0) -8.29%)",
                            filter: "drop-shadow(0px 4px 16px rgba(218, 38, 222, 0.22))",
                            borderRadius: "12px",
                            whiteSpace: "nowrap", // 防止文字换行
                        }}
                    >
                        <div
                            className="flex items-center justify-between w-full h-full px-4"
                            style={{
                                background: "linear-gradient(0deg, #9E1FCF, #9E1FCF)",
                                borderRadius: "12px",
                            }}
                        >
                            {/* 按钮文字 */}
                            <span
                                className="text-white font-semibold text-lg"
                                style={{
                                    fontFamily: "'Inter', sans-serif",
                                    lineHeight: "28px",
                                    letterSpacing: "-0.01em",
                                }}
                            >
            Claim Your Tokens
        </span>

                            {/* 按钮图标 */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-6 h-6 opacity-75 ml-2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13.5 4.5l6 6m0 0l-6 6m6-6H4.5"
                                />
                            </svg>
                        </div>
                    </button>

                </div>

                {/* 右侧图片 */}
                <div
                    className="absolute bg-cover bg-center"
                    style={{
                        width: "627px", // 与设计稿保持一致
                        height: "764px",
                        right: "0px", // 图片紧贴右侧
                        top: "96px", // 根据设计稿调整高度
                        backgroundImage: `url(${mainElement})`,
                    }}
                ></div>
            </main>

            {/* Footer */}
            <footer className="bg-purple-900 py-8 w-full">
                <div className="container mx-auto px-8">
                    <div className="flex justify-center space-x-8">
                        <img src="/path/to/asana.png" alt="Asana" className="h-8"/>
                        <img src="/path/to/hubspot.png" alt="HubSpot" className="h-8"/>
                        <img src="/path/to/stripe.png" alt="Stripe" className="h-8"/>
                        <img src="/path/to/webflow.png" alt="Webflow" className="h-8"/>
                        <img src="/path/to/mailchimp.png" alt="Mailchimp" className="h-8"/>
                        <img src="/path/to/gumroad.png" alt="Gumroad" className="h-8"/>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
