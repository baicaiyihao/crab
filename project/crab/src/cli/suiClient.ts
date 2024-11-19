import { SuiClient,getFullnodeUrl } from "@mysten/sui/client";

// 配置全局的 SuiClient 实例
export const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

export default suiClient;
