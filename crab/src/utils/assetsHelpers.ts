import { SuiObjectResponse } from "@mysten/sui/client"; // 导入 Sui 对象响应类型

export interface CategorizedObjects { // 定义分类对象接口
  coins: { // 币种对象
    [coinType: string]: SuiObjectResponse[]; // 币种类型与其对应的对象数组
  };
  objects: { // 其他对象
    [objectType: string]: SuiObjectResponse[]; // 对象类型与其对应的对象数组
  };
  coinObjects: { // 新增代币对象映射
    [coinType: string]: string[]; // 每个代币类型对应的对象 ID 数组
  };
}

export interface Balance { // 定义余额接口
  integer: bigint; // 整数部分
  decimal: string; // 小数部分
}

export const categorizeSuiObjects = (objects: SuiObjectResponse[]): CategorizedObjects => { // 分类 Sui 对象
  return objects.reduce((acc: CategorizedObjects, obj) => { // 使用 reduce 方法分类
    const content = obj.data?.content; // 获取对象内容
    if (content?.dataType !== "moveObject") { // 如果不是 moveObject 类型
      return acc; // 返回累加器
    }

    const type = content.type; // 获取对象类型
    if (type.startsWith("0x2::coin::Coin<")) { // 如果是币种类型
      const coinType = type.match(/<(.+)>/)?.[1] || "Unknown"; // 提取币种类型
      if (!acc.coins[coinType]) { // 如果币种不存在于累加器中
        acc.coins[coinType] = []; // 初始化币种数组
      }
      acc.coins[coinType].push(obj); // 将对象添加到币种数组

      // 新增逻辑：保存每个代币类型的对象 ID
      if (!acc.coinObjects[coinType]) { // 如果代币类型的数组不存在
        acc.coinObjects[coinType] = []; // 初始化数组
      }
      const objectId = obj.data?.objectId; // 获取对象 ID
      if (objectId) { // 如果对象 ID 存在
        acc.coinObjects[coinType].push(objectId); // 保存到数组中
      }
    } else { // 如果是其他对象类型
      if (!acc.objects[type]) { // 如果对象类型不存在于累加器中
        acc.objects[type] = []; // 初始化对象数组
      }
      acc.objects[type].push(obj); // 将对象添加到对象数组
    }
    return acc; // 返回累加器
  }, { coins: {}, objects: {}, coinObjects: {} }); // 初始化累加器
};

export const calculateTotalBalance = (coins: SuiObjectResponse[]): Balance => { // 计算总余额
  const total = coins.reduce((sum, coin) => { // 使用 reduce 方法计算总和
    if (coin.data && 'content' in coin.data) { // 如果对象数据存在且包含内容
      const content = coin.data.content; // 获取内容

      if (content && content.dataType === 'moveObject' && 'fields' in content) { // 如果是 moveObject 类型且包含字段
        const fields = content.fields as { balance?: string }; // 获取字段
        if ('balance' in fields) { // 如果字段中包含余额
          const balance = BigInt(fields.balance || '0'); // 转换余额为 BigInt
          return sum + balance; // 累加余额
        }
      }
    }
    return sum; // 返回当前总和
  }, BigInt(0)); // 初始化总和为 0

  const integer = total / BigInt(10 ** 9); // 计算整数部分
  const decimal = (total % BigInt(10 ** 9)).toString().padStart(9, '0'); // 计算小数部分并填充

  return { integer, decimal }; // 返回余额对象
};

export const formatBalance = (balance: Balance, decimalPlaces: number = 9): string => { // 格式化余额
  const integerPart = balance.integer.toString(); // 转换整数部分为字符串
  const decimalPart = balance.decimal.slice(0, decimalPlaces); // 获取小数部分
  return `${integerPart}.${decimalPart}`; // 返回格式化的余额字符串
};