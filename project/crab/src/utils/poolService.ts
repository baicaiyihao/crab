import { TESTNET_POOLTABLE } from "../config/constants";
import { fetchTokenDecimals } from "./tokenHelpers";
import suiClient from "../cli/suiClient";

export async function fetchPoolInfo(tokenDecimals: { [key: string]: number }) {
    const pools: any[] = [];
    const poolTable = await suiClient.getObject({
        id: TESTNET_POOLTABLE,
        options: { showContent: true },
    });

    const content = poolTable?.data?.content;
    if (
        content?.dataType === "moveObject" &&
        (content as any)?.fields?.pool_map
    ) {
        const poolMap = (content as any).fields.pool_map;

        if (Array.isArray(poolMap)) {
            for (const pool of poolMap) {
                const rawName = pool?.fields?.cointype?.fields?.name || "Unknown";
                const coinType = rawName;
                const poolId = pool?.fields?.object || "Unknown";

                const poolData = await suiClient.getObject({
                    id: poolId,
                    options: { showContent: true },
                });

                let balance = BigInt(0);
                if (poolData?.data?.content) {
                    const contentJson = JSON.parse(
                        JSON.stringify(poolData.data.content)
                    );
                    balance = BigInt(contentJson?.fields?.coin_x || "0");
                }

                let decimals = tokenDecimals[coinType];
                if (decimals == null) {
                    try {
                        decimals = await fetchTokenDecimals(suiClient, coinType);
                        decimals = decimals ?? 9; // 默认精度为 9
                    } catch (error) {
                        console.error(`Error fetching decimals for ${coinType}:`, error);
                        decimals = 9; // 设置默认精度
                    }
                    tokenDecimals[coinType] = decimals; // 缓存 decimals
                }

                pools.push({
                    name: coinType.split("::").pop(),
                    poolId: poolId,
                    balance,
                    formattedBalance: formatTokenBalance(balance, decimals),
                });
            }
        }
    }

    return pools.sort((a, b) => Number(b.balance - a.balance)); // 按余额排序
}

export function formatTokenBalance(balance: bigint, decimals: number): string {
    const integer = balance / BigInt(10 ** decimals);
    const decimal = (balance % BigInt(10 ** decimals)).toString().padStart(decimals, '0');
    return `${integer}.${decimal}`;
}
