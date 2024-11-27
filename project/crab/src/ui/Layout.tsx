import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import logo from "../assets/home/导航logo.webp";
import background from "../assets/home/背景.webp";
import navbackground from "../assets/home/导航栏背景.webp";
import RightActionButtons from "../components/RightActionButtons";

const Layout: React.FC = () => {
    const [isNarrowScreen, setIsNarrowScreen] = useState<boolean>(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    useEffect(() => {
        const handleResize = () => {
            const isNarrow = window.innerWidth < 1024;
            setIsNarrowScreen(isNarrow);

            // 如果切换到非窄屏，自动关闭下拉菜单
            if (!isNarrow) {
                setIsDropdownOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // 初始化

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

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
                className="fixed top-0 w-full z-10 h-[96px] shadow-md"
                style={{
                    backgroundImage: `url(${navbackground})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    maxWidth: "2400px",
                }}
            >
                <nav className="container mx-auto flex items-center justify-between h-full px-4">
                    {/* Logo */}
                    <a
                        href="/"
                        className="logo-container w-[162px] h-[96px] bg-center bg-cover bg-no-repeat"
                        style={{
                            backgroundImage: `url(${logo})`,
                        }}
                    ></a>

                    {/* 导航菜单 */}
                    {!isNarrowScreen && (
                        <ul className="menu-container flex gap-8 ml-[60px]" style={{ flexGrow: 2 }}>
                            {[
                                { label: "Pools", path: "/#/pools" },
                                { label: "Risk", path: "/#/risk" },
                                { label: "Points", path: "/#/rewards" },
                                { label: "Dashboard", path: "/#/dashboard" },
                                { label: "About", path: "/#/about" },
                            ].map((menu, index) => (
                                <li key={index} className="relative cursor-pointer">
                                    <a
                                        href={menu.path}
                                        className="text-[#B57FCA] font-medium text-[16px] leading-[19px] hover:text-[#E5A0FF] transition duration-300"
                                    >
                                        {menu.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* 右侧按钮 */}
                    <div className="flex items-center space-x-4">
                        {isNarrowScreen && (
                            <button
                                onClick={toggleDropdown}
                                className="hamburger-menu text-white focus:outline-none"
                            >
                                <div className="flex flex-col space-y-1">
                                    <span className="block w-8 h-1 bg-white"></span>
                                    <span className="block w-8 h-1 bg-white"></span>
                                    <span className="block w-8 h-1 bg-white"></span>
                                </div>
                            </button>
                        )}
                        <RightActionButtons />
                    </div>
                </nav>

                {/* 折叠菜单 */}
                {isNarrowScreen && isDropdownOpen && (
                    <ul className="absolute top-[96px] right-0 bg-[#471F50] rounded-lg shadow-lg text-white w-[200px]">
                        {[
                            { label: "Pools", path: "/#/pools" },
                            { label: "Risk", path: "/#/risk" },
                            { label: "Points", path: "/#/rewards" },
                            { label: "Dashboard", path: "/#/dashboard" },
                            { label: "About", path: "/#/about" },
                        ].map((menu, index) => (
                            <li key={index} className="px-4 py-2 hover:bg-purple-700 cursor-pointer">
                                <a href={menu.path}>{menu.label}</a>
                            </li>
                        ))}
                    </ul>
                )}
            </header>

            {/* 子路由内容 */}
            <main className="flex-1 mt-[96px]">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-purple-900 py-8 w-full">
                <div className="container mx-auto px-8">
                    <div className="flex justify-center space-x-8">
                        <p className="text-white text-sm">© 2024 Crab Dapp. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
