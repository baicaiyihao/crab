import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <>
            {/* 主体内容 */}
            <main
                className="container mx-auto flex flex-1 flex-col items-center justify-center lg:items-start mt-[168px]"
                style={{
                    paddingLeft: "20px", // 与 Logo 的对齐距离
                }}
            >
                {/* 左侧文字 */}
                <div
                    className={`flex flex-col space-y-6 items-start`}
                    style={{
                        maxWidth: "1200px",
                    }}
                >
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
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center justify-center px-6 py-3 rounded-lg shadow-md font-semibold text-white transition duration-300"
                        style={{
                            minWidth: "200px",
                            height: "50px",
                            background: "linear-gradient(90deg, #9B5EFA 0%, #704BDF 100%)",
                            borderRadius: "12px",
                        }}
                    >
                        <span>LAUNCH APP</span>
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
            </main>
        </>
    );
};

export default HomePage;
