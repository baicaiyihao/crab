import React, { useState } from "react";
import axios from "axios";

const ImageUploader = () => {
    const [urls, setUrls] = useState<string>(""); // 存储输入的 URL
    const [responseMessages, setResponseMessages] = useState<string[]>([]); // 存储返回信息
    const uploadUrl = "https://publisher.walrus-testnet.walrus.space/v1/store?epochs=100"; // 上传接口

    const handleUrlsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUrls(event.target.value); // 更新输入值
    };

    const handleUpload = async () => {
        const urlArray = urls.split("\n").map((url) => url.trim()); // 处理多个 URL
        const messages: string[] = [];

        for (const imageUrl of urlArray) {
            if (!imageUrl) continue; // 跳过空行

            try {
                // 获取图片内容
                const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
                const blob = new Blob([response.data], { type: response.headers["content-type"] });

                // 创建 FormData 对象
                const formData = new FormData();
                formData.append("file", blob, "uploaded-image.png");

                // 发送 PUT 请求上传图片
                const uploadResponse = await axios.put(uploadUrl, blob, {
                    headers: { "Content-Type": "application/octet-stream" },
                });

                if (uploadResponse.status === 200) {
                    const responseData = JSON.stringify(uploadResponse.data, null, 2);

                    messages.push(`BlobId: ${responseData}`);
                } else {
                    messages.push(`Failed to upload image from ${imageUrl}, status code: ${uploadResponse.status}`);
                }
            } catch (error) {
                messages.push(`Error uploading image from ${imageUrl}: ${error}`);
            }
        }

        setResponseMessages(messages); // 更新返回信息
    };

    return (
        <div className="image-uploader">
            <h1>Image Uploader</h1>
            <textarea
                rows={10}
                cols={50}
                value={urls}
                onChange={handleUrlsChange}
                placeholder="Enter image URLs, one per line..."
            />
            <br />
            <button onClick={handleUpload} className="upload-button">
                Upload Images
            </button>

            <div className="upload-results">
                <h2>Upload Results:</h2>
                <ul>
                    {responseMessages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ImageUploader;
