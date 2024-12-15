import React, { useState } from 'react';
import axios from "axios";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import '../css/upload.css'

function Upload() {
    const { mutateAsync: signAndExecute, isError } = useSignAndExecuteTransaction();
    const [message, setMessage] = useState("暂无上传图片");
    const imageUrlRef = React.useRef(null);
    const imageUrlRef2 = React.useRef(null);
    const coinTypeRef = React.useRef(null);
    const blobIdRef = React.useRef(null);
    const uploadUrl = "https://publisher.walrus-testnet.walrus.space/v1/store?epochs=100";
    const currentAccount = useCurrentAccount();

    const AddIcon = async (coinType, blobId) => {
        console.log(1);
        console.log(coinType, blobId);

        if (!currentAccount?.address) {
            console.error("No connected account found.");
            setMessage("Please connect your wallet.");
            return;
        }

        try {
            console.log(2);
            const tx = new Transaction();
            tx.setGasBudget(10000000);
            tx.moveCall({
                arguments: [
                    tx.pure(bcs.string().serialize(coinType).toBytes()), // 用户输入的名称
                    tx.pure(bcs.string().serialize(blobId).toBytes()), // 用户输入的 Blob ID
                    tx.object("0xf8a5237b86cff9fc42e8f59f5d7c925c084221c15f5cc84061b0745610bf4529"), // 固定参数
                ],
                target: "0xc5abe2c8c58ae4ff3e2292f13c11b32b6aabb5e3f40577b25ea0667328b9a88b::storeicon::add_icon", // 调用目标
            });

            const result = await signAndExecute({ transaction: tx });
            console.log("result:", result);

            // 这里可以继续添加发送交易的逻辑
        } catch (error) {
            console.error("Error adding icon:", error);
        }
    };

    const DataTable = (resdata) => {
        console.log("Function receiveData:", resdata);
        const data = resdata.responseData;
        const blobId = data.alreadyCertified.blobId;
        const blobUrl = `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`;
        const tableData = [
            { key: 'Blob ID：', value: blobUrl },
            { key: 'Transaction Digest：', value: data.alreadyCertified.eventOrObject.Event.txDigest },
            { key: 'Event Sequence：', value: data.alreadyCertified.eventOrObject.Event.eventSeq },
            { key: 'End Epoch：', value: data.alreadyCertified.endEpoch }
        ];

        return (
            <>
                <div style={{marginBottom:"10%"}}>
                    <table style={{borderCollapse: 'collapse', width: '100%'}}>
                        <thead>
                        <tr style={{backgroundColor: '#f2f2f2'}}>
                            <th style={{border: '1px solid #ddd', padding: '8px'}}>Key</th>
                            <th style={{border: '1px solid #ddd', padding: '8px'}}>Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tableData.map((item, index) => (
                            <tr key={index} style={{backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff'}}>
                                <td style={{border: '1px solid #ddd', padding: '8px'}}>{item.key}</td>
                                <td style={{border: '1px solid #ddd', padding: '8px'}}>{item.value}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div style={{marginTop:"10%"}}>
                    <img src={blobUrl} alt={blobId}/>
                </div>

            </>
        );
    };

    const coinTypeUpload = async () => {
        const coinType = imageUrlRef.current.value;
        const coinTypeUrl = `https://crab.al17er.icu:40388/priapi/v1/dx/market/v2/search?keyword=${encodeURIComponent(coinType)}&chainId=all&userUniqueId=838942D9-41FC-4D31-8673-3CEB3D2E8E3A&t=1733364066679`;
        console.log(coinTypeUrl);
        const coinIconResponse = await axios.get(coinTypeUrl);
        const CoinIconUrl = coinIconResponse.data.data[0].tokenLogoUrl;
        const response = await axios.get(CoinIconUrl, {responseType: "arraybuffer"});
        const blob = new Blob([response.data], {type: response.headers["content-type"]});
        const formData = new FormData();
        formData.append("file", blob, "uploaded-image.png");
        let uploadResponse = await axios.put(uploadUrl, blob, {
            headers: { "Content-Type": "application/octet-stream" },
        });
        if ("newlyCreated" in uploadResponse.data) {
            console.log("有新增数据！");
            uploadResponse = await axios.put(uploadUrl, blob, {
                headers: { "Content-Type": "application/octet-stream" },
            });
        }

        if (uploadResponse.status === 200) {
            const responseData = uploadResponse.data;
            console.log(responseData[0]);
            console.log("data", responseData);
            console.log("DataTable", DataTable({ responseData }));
            setMessage(<div>{DataTable({ responseData })}</div>);
            await AddIcon(coinType, responseData.alreadyCertified.blobId);
        } else {
            setMessage("Failed to upload image!");
        }
    };

    const uploadImage = async () => {
        const url = imageUrlRef.current.value;
        console.log(url);
        const response = await axios.get(url, { responseType: "arraybuffer" });
        console.log(response);
        const blob = new Blob([response.data], { type: response.headers["content-type"] });
        const formData = new FormData();
        formData.append("file", blob, "uploaded-image.png");
        var uploadResponse = await axios.put(uploadUrl, blob, {
            headers: { "Content-Type": "application/octet-stream" },
        });
        if ("newlyCreated" in uploadResponse.data) {
            console.log("有新增数据！");
            uploadResponse = await axios.put(uploadUrl, blob, {
                headers: { "Content-Type": "application/octet-stream" },
            });
        }
        if (uploadResponse.status === 200) {
            const responseData = uploadResponse.data;
            console.log(responseData);
            console.log("data", responseData.alreadyCertified.blobId);
            console.log("DataTable", DataTable({ responseData }));
            setMessage(<div>{DataTable({ responseData })}</div>);
        } else {
            setMessage("Failed to upload image!");
        }
    };

    return (
        <div>
            <input className="inputbox" placeholder={"请输入CoinType或ImageURL"} ref={imageUrlRef}></input>
            <div style={{textAlign: "center"}}>
                <button style={{marginRight: "10%"}} className="button" onClick={coinTypeUpload}>CoinType Upload
                </button>
                <button className="button" onClick={uploadImage}>URL Upload</button>
            </div>
            <br/>
            <input className="inputbox" placeholder={"输入CoinType，使用URL上传图片填写，使用CoinType无需进行手动上传合约"} ref={coinTypeRef}></input>
            <input className="inputbox" placeholder={"请输入blob，使用URL上传图片填写，使用CoinType无需进行手动上传合约"} ref={blobIdRef}></input>
            <div style={{textAlign: "center", marginTop: "10%"}}>
                {message}
            </div>

            <br/>
            <div style={{textAlign: "center"}}>
                <button className="button" onClick={() => {
                    AddIcon(coinTypeRef.current.value, blobIdRef.current.value)
                }}>上传合约
                </button>
            </div>

        </div>
    );
}

export default Upload;