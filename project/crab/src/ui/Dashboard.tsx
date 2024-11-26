import GetTransferDetails from "../pages/GetTransferInfo";
import Getcoininfo from "../pages/Getcoininfo";

export default function Dashboard() {

    return (
        <div className="container mx-auto px-4 py-8">

            {/* 主体内容 */}
            <div className="grid grid-cols-3 gap-6">
                {/* 左侧主要内容 */}
                <div className="col-span-2 bg-[#1F1B2D] p-6 rounded-lg shadow-md">
                    <GetTransferDetails />
                </div>

                {/* 右侧用户信息 */}
                <div className="bg-[#1F1B2D] p-6 rounded-lg shadow-md">
                    <Getcoininfo />
                </div>
            </div>
        </div>
    );
}
