import { SuiClient } from "@mysten/sui/client";

/**
 * 获取代币的精度
 * @param suiClient SuiClient 实例
 * @param coinType 代币类型
 * @returns 代币的精度，默认返回 9
 */
export async function fetchTokenDecimals(suiClient: SuiClient, coinType: string): Promise<number> {
    try {
        const metadata = await suiClient.getCoinMetadata({ coinType });
        if (metadata && metadata.decimals != null) {
            return metadata.decimals;
        } else {
            console.warn(`No metadata found for ${coinType}, using default decimals.`);
            return 9; // 默认精度
        }
    } catch (error) {
        console.error(`Error fetching metadata for ${coinType}:`, error);
        return 9; // 如果出错，返回默认精度
    }
}
