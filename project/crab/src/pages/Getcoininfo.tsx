import New_pool from "../components/new_pool";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect, useState, useMemo } from "react";
import { getUserProfile } from "../utils";
import warnCramImage from '../assets/warnCram.png';
import { CategorizedObjects, calculateTotalBalance } from "../utils/assetsHelpers";
import { TESTNET_CRAB_PACKAGE_ID, TESTNET_POOLTABLE, TESTNET_TIME, TESTNET_TRANSFERRECORDPOOL, TESTNET_SCAMCOINPOOL } from "../config/constants";
import Deposit from "../components/deposit";
import { fetchPoolIdForCoin } from "../utils/poolHelpers"; // 导入 helper
import { fetchTokenDecimals } from "../utils/tokenHelpers";
import suiClient from "../cli/suiClient";
import NFTModal from "../components/NFTModal";
import GetCoinPrice from "../components/GetCoinPrice";
import GetCoinIcon from "../components/GetCoinIcon";


export default function GetCoinInfo() {
    const account = useCurrentAccount();
    const [userObjects, setUserObjects] = useState<CategorizedObjects | null>(null);
    const [tokenDecimals, setTokenDecimals] = useState<{ [coinType: string]: number }>({});
    const [demoNftId, setDemoNftId] = useState<string | null>(null);
    const [coinPoolMap, setCoinPoolMap] = useState<{ [coinType: string]: string | null }>({});
    const [isLoading, setIsLoading] = useState<boolean>(true); // 新增加载状态
    const [copiedCoinType, setCopiedCoinType] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [itemsPerPage, setItemsPerPage] = useState(10); // 每页显示的项目数量
    const [currentPage, setCurrentPage] = useState(1); // 当前页码
    const [scamCoinChecknums, setScamCoinChecknums] = useState<{ [coinType: string]: number }>({});

    const formatCoinType = (coinType: string): string => {
        if (coinType.length > 20) {
            return `${coinType.slice(0, 6)}...${coinType.slice(-4)}`;
        }
        return coinType;
    };

    async function refreshUserProfile() {
        if (!account?.address) {
            return;
        }

        try {
            setIsLoading(true); // 开始加载时设置为 true
            await new Promise(resolve => setTimeout(resolve, 200)); // 延时 2 秒
            const profile = await getUserProfile(account.address);
            setUserObjects(profile);

            // 获取诈骗币信息
            const scamCoinPool = await suiClient.getObject({
                id: TESTNET_SCAMCOINPOOL,
                options: { showContent: true },
            });

            const content = scamCoinPool?.data?.content;
            if (
              content?.dataType === "moveObject" &&
              (content as any)?.fields?.ScamCoin_map
            ) {
                const scamCoinMap = (content as any).fields.ScamCoin_map;
                if (Array.isArray(scamCoinMap)) {
                    const scamCoins = await Promise.all(
                      scamCoinMap.map(async (scamCoinInfo) => {
                          const scamCoinId = scamCoinInfo?.fields?.ScamCoin_id || "Unknown";
                          const rawCoinType = scamCoinInfo?.fields?.cointype?.fields?.name || "Unknown";

                          if (!scamCoinId || scamCoinId === "Unknown") {
                              console.warn("Invalid ScamCoin ID, skipping:", scamCoinId);
                              return null;
                          }

                          try {
                              const scamCoinData = await suiClient.getObject({
                                  id: scamCoinId,
                                  options: { showContent: true },
                              });

                              let checknum = 0;
                              let cointype = "Unknown";
                              if (scamCoinData?.data?.content) {
                                  const contentJson = JSON.parse(JSON.stringify(scamCoinData.data.content));
                                  checknum = parseInt(contentJson?.fields?.checknum || "0", 10);
                                  cointype = contentJson?.fields?.cointype?.fields?.name || rawCoinType;
                              }

                              return {
                                  name: `0x${cointype}`.split("::").pop(),
                                  scamCoinId,
                                  checknum,
                                  cointype,
                              };
                          } catch (error) {
                              console.error(`Error fetching ScamCoin ID ${scamCoinId}:`, error);
                              return null;
                          }
                      })
                    );

                    const filteredScamCoins = scamCoins.filter((coin) => coin !== null);
                    const scamCoinChecknums = filteredScamCoins.reduce((acc, coin) => {
                        if (coin !== null) {
                            acc[coin.cointype]=coin.checknum;
                        }
                        return acc;
                    }, {} as { [coinType: string]: number });
                    setScamCoinChecknums(scamCoinChecknums);
                }
            }

            const coinTypes = Object.keys(profile.coins || {});
            for (const coinType of coinTypes) {
                // 使用 helper 方法获取精度
                const decimals = await fetchTokenDecimals(suiClient, coinType);
                setTokenDecimals(prev => ({ ...prev, [coinType]: decimals }));

                // 检查 poolId 是否存在
                const poolId = await fetchPoolIdForCoin(TESTNET_POOLTABLE, coinType);
                setCoinPoolMap(prev => ({ ...prev, [coinType]: poolId }));
            }

            const demoNftObject = Object.entries(profile.objects || {}).find(([objectType]) =>
              objectType.includes(`${TESTNET_CRAB_PACKAGE_ID}::demo::DemoNFT`)
            );
            if (demoNftObject) {
                const demoNftInstances = demoNftObject[1];
                if (Array.isArray(demoNftInstances) && demoNftInstances.length > 0) {
                    setDemoNftId(demoNftInstances[0]?.data?.objectId || null);
                } else {
                    setDemoNftId(null);
                }
            } else {
                setDemoNftId(null);
            }
        } catch (error) {
            console.error("Error refreshing user profile:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (account?.address) {
            refreshUserProfile();
        }
    }, [account]);

    const paginatedData = useMemo(() => {
        if (!userObjects || !userObjects.coins) return [];
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return Object.entries(userObjects.coins).slice(start, end);
    }, [userObjects, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(Object.keys(userObjects?.coins || {}).length / itemsPerPage);

    const formatTokenBalance = (balance: bigint, decimals: number): string => {
        const integer = balance / BigInt(10 ** decimals);
        const decimal = (balance % BigInt(10 ** decimals)).toString().padStart(decimals, '0');
        return `${integer}.${decimal}`;
    };

    const handleCopyCoinType = (coinType: string) => {
        navigator.clipboard.writeText(coinType).then(() => {
            setCopiedCoinType(coinType);
            setTimeout(() => setCopiedCoinType(null), 2000); // 2秒后清除已复制标识
        }).catch((error) => {
            console.error('Failed to copy:', error);
        });
    };

    return (
      <div className="mt-8">
          {/* Token List Table */}
          <div className="overflow-hidden rounded-lg bg-[#1F1B2D] border border-purple-600">
              <table className="w-full text-left text-white border-collapse">
                  <thead className="bg-[#29263A]">
                  <tr>
                      <th className="px-6 py-3 border-t border-t-[#1E1C28]" >#</th> {/* 序号 */}
                      <th className="px-6 py-3 border-t border-t-[#1E1C28]" >Token</th>
                      <th className="px-6 py-3 border-t border-t-[#1E1C28]" >Price</th>
                      <th className="px-6 py-3 border-t border-t-[#1E1C28]" >Total Balance</th>
                      <th className="px-6 py-3 border-t border-t-[#1E1C28]">Action</th>
                  </tr>
                  </thead>
                  <tbody>
                  {isLoading ? (
                    // 如果加载中，显示动画
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="bg-[#29263A] border-t border-t-[#1E1C28] animate-pulse">
                          <td className="px-6 py-4 border-t border-t-[#1E1C28]">
                              <div className="w-6 h-6 bg-gray-500 rounded-md"></div>
                          </td>
                          <td className="px-6 py-4 border-t border-t-[#1E1C28]">
                              <div className="w-24 h-6 bg-gray-500 rounded-md"></div>
                          </td>
                          <td className="px-6 py-4 border-t border-t-[#1E1C28]">
                              <div className="w-32 h-6 bg-gray-500 rounded-md"></div>
                          </td>
                          <td className="px-6 py-4 border-t border-t-[#1E1C28]">
                              <div className="w-16 h-6 bg-gray-500 rounded-md"></div>
                          </td>
                          <td className="px-6 py-4 border-t border-t-[#1E1C28]">
                              <div className="w-32 h-6 bg-gray-500 rounded-md"></div>
                          </td>
                      </tr>
                    ))
                  ) : (
                    paginatedData.length > 0 ? (
                      paginatedData.map(([coinType, coins], index) => {
                          const coinObjectIds = coins.map((coin) => coin.data?.objectId || "N/A");
                          const totalBalance = calculateTotalBalance(coins);
                          const decimals = tokenDecimals[coinType] ?? 9;
                          const formattedBalance = formatTokenBalance(
                            totalBalance.integer * BigInt(10 ** 9) + BigInt(totalBalance.decimal),
                            decimals
                          );
                          const poolId = coinPoolMap[coinType];

                          const cleanCoinType = coinType.replace(/^0x/, '');
                          let coin_price_address = coinType;

                          let target_address = "0x2::sui::SUI";

                          if (coin_price_address.trim() === target_address) { // 使用 trim() 去除潜在的空白字符
                              coin_price_address = "0x83556891f4a0f233ce7b05cfe7f957d4020492a34f5405b2cb9377d060bef4bf::spring_sui::SPRING_SUI";
                          }

                          let checknum = scamCoinChecknums[cleanCoinType] || 0;
                          return (
                            <tr
                              key={index}
                              className={`${
                                index % 2 === 0 ? "bg-[#29263A]" : "bg-[#26223B]"
                              } border-t border-t-[#1E1C28] hover:bg-[#444151]`}
                            >
                                <td className="px-6 py-4 border-t border-t-[#1E1C28] text-white" style={{textAlign:"left"}}>{index + 1}</td>
                                <td className="px-4 py-4 border-t border-t-[#1E1C28] text-white" >
                                    <div className="flex items-center">
                                        <div className="mr-2" style={{width:24,height:24,borderRadius:50}}>
                                            <GetCoinIcon coin_address={coinType} />
                                        </div>
                                    <div>
                                        <div className="font-semibold text-purple-300">{coinType.split("::").pop()}
                                            {checknum >= 3 && (
                                                <img style={{margin:5}} src={warnCramImage} title="This may be a scam coin" alt="Warning" className="w-4 h-4 inline-block"/>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500" onClick={() => handleCopyCoinType(coinType)}>
                                            <span>
                                                {`${formatCoinType(coinType)}`}
                                            </span>
                                            {copiedCoinType === coinType && (
                                                <span className="ml-2 text-green-500">☑️</span>
                                            )}
                                        </div>
                                    </div>
                                    {/*<div*/}
                                    {/*  className="text-sm text-gray-400 cursor-pointer relative group"*/}
                                    {/*  onClick={() => handleCopyCoinType(coinType)}*/}
                                    {/*>*/}
                                    {/*    <span>{`${formatCoinType(coinType)}`}</span>*/}
                                    {/*    {copiedCoinType === coinType && (*/}
                                    {/*      <span className="ml-2 text-green-500">☑️</span>*/}
                                    {/*    )}*/}
                                    {/*</div>*/}
                                    </div>
                                </td>
                                <td className="px-6 py-4 border-t border-t-[#1E1C28] " style={{textAlign:"left"}}><GetCoinPrice coin={coin_price_address} /></td>
                                <td className="px-6 py-4 border-t border-t-[#1E1C28] text-white" style={{textAlign:"left"}}>{formattedBalance}</td>
                                <td className="px-6 py-4 border-t border-t-[#1E1C28]" style={{textAlign:"left"}}>
                                    {demoNftId ? (
                                      poolId ? (
                                        <Deposit
                                          coinType={coinType}
                                          poolId={poolId}
                                          coinObjects={coinObjectIds}
                                          demoNftId={demoNftId}
                                          transferRecordPoolId={TESTNET_TRANSFERRECORDPOOL}
                                          extraParam={TESTNET_TIME}
                                          onSuccess={refreshUserProfile}
                                        />
                                      ) : (
                                        <New_pool
                                          crabPackageId={TESTNET_CRAB_PACKAGE_ID}
                                          coinType={coinType}
                                          coinObjects={coinObjectIds}
                                          poolTableId={TESTNET_POOLTABLE}
                                          demoNftId={demoNftId}
                                          transferRecordPoolId={TESTNET_TRANSFERRECORDPOOL}
                                          extraParam={TESTNET_TIME}
                                          onSuccess={refreshUserProfile}
                                        />
                                      )
                                    ) : (
                                      <div>
                                          <button
                                            className="mark-as-scam-button"
                                            onClick={() => setIsModalOpen(true)}
                                          >
                                              Recycle
                                          </button>
                                          {isModalOpen && (
                                            <NFTModal
                                              onClose={() => setIsModalOpen(false)}
                                              onSuccess={() => {
                                                  refreshUserProfile();
                                                  setIsModalOpen(false);

                                              }}
                                            />
                                          )}
                                      </div>
                                    )}
                                </td>
                            </tr>
                          );
                      })
                    ) : (
                      <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-red-500">No tokens found</td>
                      </tr>
                    )
                  )}
                  </tbody>
              </table>
          </div>
          {/* 分页控件 */}
          <div className="flex items-center justify-between mt-6">
              <div className="flex items-center">
                  <span className="text-white mr-4">Show:</span>
                  <select
                    className="px-4 py-2 rounded-lg border border-gray-700 bg-[#1F1B2D] text-white"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                      {[10, 20, 50].map((num) => (
                        <option key={num} value={num}>
                            {num}
                        </option>
                      ))}
                  </select>
              </div>
              <div className="flex items-center">
                  <span className="text-white mr-4">Total: {userObjects?.coins ? Object.entries(userObjects.coins).length : 0}</span>
              </div>
              <div className="flex items-center">
                  <button
                    className="px-4 py-2 mx-1 text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  >
                      &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`px-4 py-2 mx-1 text-white rounded-md ${
                        currentPage === page
                          ? "bg-purple-600"
                          : "bg-[#29263A] hover:bg-[#444151]"
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </button>
                  ))}
                  <button
                    className="px-4 py-2 mx-1 text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                      &gt;
                  </button>
              </div>
          </div>
      </div>
    );
}