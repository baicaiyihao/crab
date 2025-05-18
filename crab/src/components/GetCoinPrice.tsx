import { Component } from "react";

interface TokenInfo {
  chainId: string;
  chainLogoUrl: string;
  chainName: string;
  change: string;
  collectionToken: string;
  decimal: string;
  explorerUrl: string;
  holderAmount: string;
  isCustomToken: string;
  isNativeToken: string;
  isSubscribe: string;
  liquidity: string;
  marketCap: string;
  matchType: string | null;
  price: string;
  tokenContractAddress: string;
  tokenLogoUrl: string;
  tokenName: string;
  tokenSupportTradeModeVO: { supportMemeMode: string };
  tokenSymbol: string;
  volume: string;
}

interface ApiResponse {
  code: number;
  data: TokenInfo[];
  detailMsg: string;
  error_code: string;
  error_message: string;
  msg: string;
}

interface KuayuState {
  loading: boolean;
  price: string | null;
  error: string | null;
}

interface KuayuProps {
  coin: string; // 添加一个 coin 属性到 props 中
}

export default class GetCoinPrice extends Component<KuayuProps, KuayuState> {
  constructor(props: KuayuProps) {
    super(props);
    this.state = {
      loading: true,
      price: null,
      error: null,
    };
  }

  componentDidMount() {
    this.getData(this.props.coin);
  }

  async getData(coin: string): Promise<void> {
    try {
      const url = `https://crab.al17er.icu:40388/priapi/v1/dx/market/v2/search?keyword=${encodeURIComponent(coin)}&chainId=all&userUniqueId=838942D9-41FC-4D31-8673-3CEB3D2E8E3A&t=1733364066679`;
      let response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      let res: ApiResponse = await response.json();

      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        // 将价格转换为数字并格式化为3位小数
        const firstItemPrice = parseFloat(res.data[0].price).toFixed(3);
        this.setState({ loading: false, price: firstItemPrice });
      } else {
        this.setState({ loading: false, error: 'No data found.' });
      }

    } catch (err) {
      console.error("Fetch error:", err);
      this.setState({ loading: false, error: 'Error fetching data.' });
    }
  }

  render() {
    const { loading, price, error } = this.state;

    const style = {
      color: 'white', // 设置字体颜色为白色
      fontWeight: 'bold', // 设置字体为加粗
    };

    if (loading) {
      return <p style={style}>Loading...</p>;
    }

    if (error) {
      return <p style={style}>-</p>;
    }

    if (price) {
      // 渲染时直接使用已格式化的 price 字符串
      return <p style={style}> ${price}</p>;
    }

    return <p style={style}>-</p>;
  }
}