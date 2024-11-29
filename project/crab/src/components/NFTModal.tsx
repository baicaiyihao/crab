import React from "react";
import CreateNFT from "./CreateNFT";
import "../styles/NFTModal.css"; // 导入样式文件

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
                className="box"
                onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
            >
                {/* 标题部分 */}
                <div className="title-bar">
                    <h2 className="title">Create NFT Identity</h2>
                    <button
                        onClick={onClose}
                        className="close-btn"
                    >
                        ×
                    </button>
                </div>

                {/* 提示文字部分 */}
                <p className="message">
                    To ensure secure operations and unlock more features, please create your NFT identity first.
                </p>

                {/* 创建 NFT 按钮放置在底部 */}
                <div
                    className="button-container"
                >
                    <CreateNFT onSuccess={onSuccess} />
                </div>
            </div>
        </div>
    );
};

export default NFTModal;
