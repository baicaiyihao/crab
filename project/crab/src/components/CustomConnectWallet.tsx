import React, { useState, useEffect, useRef } from "react";
import { useCurrentAccount, useConnectWallet, useWallets, useDisconnectWallet } from "@mysten/dapp-kit";

const CustomConnectWallet: React.FC = () => {
    const account = useCurrentAccount(); // 当前连接的账户
    const wallets = useWallets(); // 获取可用钱包
    const { mutate: connect } = useConnectWallet(); // 连接钱包函数
    const { mutate: disconnect } = useDisconnectWallet(); // 断开连接函数

    const [showDropdown, setShowDropdown] = useState(false); // 控制下拉框显示状态
    const dropdownRef = useRef<HTMLDivElement>(null); // 下拉框的 ref
    const buttonRef = useRef<HTMLButtonElement>(null); // 连接按钮的 ref

    // 连接钱包的处理函数
    const handleConnectWallet = () => {
        if (wallets.length > 0) {
            connect(
                { wallet: wallets[0] }, // 自动选择第一个钱包，钱包界面会弹出选择
                {
                    onSuccess: () => console.log("Wallet connected!"),
                }
            );
        } else {
            console.error("No wallets detected");
        }
    };

    // 复制地址的处理函数
    const handleCopyAddress = () => {
        if (account?.address) {
            navigator.clipboard.writeText(account.address);
        }
    };

    // 断开连接的处理函数
    const handleDisconnectWallet = () => {
        disconnect();
        setShowDropdown(false); // 关闭下拉框
    };

    // 监听点击事件来关闭下拉框
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // 判断点击是否发生在按钮或下拉框外部
            if (
                buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        // 添加事件监听
        document.addEventListener("click", handleClickOutside);

        // 清理事件监听
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    if (account) {
        // 已连接状态
        return (
            <div className="relative">
                {/* 已连接钱包的按钮 */}
                <button
                    ref={buttonRef}
                    className="text-white bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    onClick={() => setShowDropdown((prev) => !prev)} // 切换下拉框显示状态
                >
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </button>

                {/* 下拉框 */}
                {showDropdown && (
                    <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg z-10">
                        <div className="px-4 py-2 border-b border-gray-700">
                            <p className="text-sm break-words">{account.address.slice(0, 6)}...{account.address.slice(-4)}</p>
                            <button
                                className="text-blue-400 text-sm hover:underline"
                                onClick={handleCopyAddress}
                            >
                                Copy
                            </button>
                        </div>
                        <button
                            className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700"
                            onClick={handleDisconnectWallet}
                        >
                            Disconnect
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // 未连接状态
    return (
        <button
            className="text-white bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            onClick={handleConnectWallet}
        >
            Connect Wallet
        </button>
    );
};

export default CustomConnectWallet;
