import { isValidSuiAddress } from "@mysten/sui/utils"; // 导入验证 Sui 地址的函数
import { getFullnodeUrl, SuiClient, SuiObjectResponse } from "@mysten/sui/client"; // 导入 Sui 对象响应类型
import { categorizeSuiObjects, CategorizedObjects } from "./assetsHelpers"; // 导入分类对象的函数和接口

export const getUserProfile = async (address: string): Promise<CategorizedObjects> => { // 定义获取用户资料的异步函数
  if (!isValidSuiAddress(address)) { // 验证地址是否合法
    throw new Error("Invalid Sui address"); // 抛出错误
  }

  let hasNextPage = true; // 初始化是否有下一页
  let nextCursor: string | null = null; // 初始化游标
  let allObjects: SuiObjectResponse[] = []; // 初始化所有对象数组

  while (hasNextPage) { // 循环获取所有对象
    const suiClient = new SuiClient({url: getFullnodeUrl("testnet")})
    const response = await suiClient.getOwnedObjects({ // 获取拥有的对象
      owner: address, // 设置拥有者地址
      options: { // 设置选项
        showContent: true, // 显示内容
      },
      cursor: nextCursor, // 设置游标
    });

    allObjects = allObjects.concat(response.data); // 将获取的对象添加到所有对象数组
    hasNextPage = response.hasNextPage; // 更新是否有下一页
    nextCursor = response.nextCursor ?? null; // 更新游标
  }
  return categorizeSuiObjects(allObjects); // 返回分类后的对象

};