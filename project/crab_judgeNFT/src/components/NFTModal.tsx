import React from "react";
import CreateNFT from "./CreateNFT";

interface NFTModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const NFTModal: React.FC<NFTModalProps> = ({ onClose, onSuccess }) => {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose} // 点击背景关闭弹窗
        >
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-[300px]"
                onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Create NFT</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>
                <p className="mb-4">点击按钮以创建您的 NFT。</p>
                <CreateNFT onSuccess={onSuccess} />
            </div>
        </div>
    );
};

export default NFTModal;
