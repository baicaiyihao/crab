import React, { useState, useEffect, useRef } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { getUserProfile } from "../utils";
import { TESTNET_CRAB_PACKAGE_ID } from "../config/constants";
import usericon from "../assets/home/usericon.webp";

const UserInfoDropdown: React.FC = () => {
    const account = useCurrentAccount();
    const [userPoints, setUserPoints] = useState<number>(0);
    const [userId, setUserId] = useState<string>("N/A");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 获取用户信息并解析 DemoNFT 数据
    const fetchUserInfo = async () => {
        if (account?.address) {
            try {
                const profile = await getUserProfile(account.address);

                // 查找包含 DemoNFT 的对象
                const demoNFT = Object.entries(profile.objects || {}).find(([objectType]) =>
                    objectType.includes(`${TESTNET_CRAB_PACKAGE_ID}::demo::DemoNFT`)
                );

                if (demoNFT) {
                    const demoNFTData = demoNFT[1];
                    if (Array.isArray(demoNFTData) && demoNFTData.length > 0) {
                        // 获取第一个 DemoNFT 数据
                        const firstNFT = demoNFTData[0];
                        const content = firstNFT?.data?.content;

                        // 如果 content 是复杂对象，则转换为 JSON 并安全访问 fields
                        if (content && typeof content === "object") {
                            const fields = JSON.parse(JSON.stringify(content)).fields || {};
                            setUserPoints(fields?.users_points || 0);
                            setUserId(fields?.userid || "N/A");
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        fetchUserInfo();
    }, [account]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* 显示用户积分的按钮 */}
            <button
                className="flex items-center px-4 py-2 bg-[#29263A] text-white rounded-lg hover:bg-[#3A3A4D] transition"
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <img
                    src={usericon}
                    alt="User Icon"
                    className="w-5 h-5 mr-2"
                />
                {userPoints}
            </button>

            {/* 下拉菜单显示详细用户信息 */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#29263A] rounded-lg shadow-lg text-white z-10">
                    <div className="px-4 py-3 border-b border-gray-600">
                        <p className="text-sm font-medium text-gray-400">User ID</p>
                        <p className="text-lg font-bold truncate">{userId}</p>
                    </div>
                    <div className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-400">Points</p>
                        <p className="text-lg font-bold">{userPoints}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserInfoDropdown;
