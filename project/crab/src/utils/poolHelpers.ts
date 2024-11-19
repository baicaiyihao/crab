import suiClient from "../cli/suiClient.ts";

/**
 * 根据 coinType 遍历并查找对应的 poolId
 * @param poolTableId - 池子表 ID
 * @param coinType - 代币类型
 * @returns Promise<string | null> - 返回 poolId 或 null
 */
export async function fetchPoolIdForCoin(poolTableId: string, coinType: string): Promise<string | null> {
    try {
        const poolTable = await suiClient.getObject({
            id: poolTableId,
            options: { showContent: true },
        });

        const content = poolTable?.data?.content;

        if (
            content?.dataType === "moveObject" &&
            (content as any)?.fields?.pool_map // 强制类型检查，访问 pool_map
        ) {
            const poolMap = (content as any).fields.pool_map;

            if (Array.isArray(poolMap)) {
                for (const pool of poolMap) {
                    const cointypeName = `0x${pool.fields.cointype.fields.name}`;
                    const poolObjectId = pool?.fields?.object;

                    if (cointypeName === coinType) {
                        return poolObjectId || null;
                    }
                }
            } else {
                console.warn("pool_map is not an array.");
            }
        } else {
            console.warn("pool_map does not exist or is not valid.");
        }

        return null;
    } catch (error) {
        console.error(`Error fetching poolId for coinType ${coinType}:`, error);
        return null;
    }
}
