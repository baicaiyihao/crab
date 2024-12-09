import React from "react";
import { useNavigate } from "react-router-dom";
import icon4 from "../assets/home/ICON4.png";
import icon3 from "../assets/home/ICON3.png";
import icon1 from "../assets/home/ICON1.png";

const gradientStyle = {
  backgroundImage: "linear-gradient(90deg, #E3DFF4 0%, #D165FA 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  color: "transparent" // Fallback for browsers that do not support text-fill-color
};

const purpleTextStyle = {
  color: "#AD78C1" // Define the bright purple color here
};

// 定义一个更大的字体大小样式
const largeTitleStyle = {
  ...gradientStyle,
  fontSize: "2.5rem", // 增大字体大小，可以根据需要调整
  lineHeight: 1.2 // 调整行高以适应新的字体大小
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
      <div className="bg-cover bg-center" style={{backgroundImage: "url('../assets/home/background.jpg')"}}>
        <main className="container mx-auto flex flex-1 flex-col items-center justify-center lg:items-start mt-[168px]"
              style={{paddingLeft: "20px"}}>
          {/* 左侧文字 */}
          <div className="flex flex-col space-y-6 items-start" style={{maxWidth: "1200px"}}>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight" style={gradientStyle}>
              Clear Bad Assets,<br/>
              Unlock a Smarter Digital World
            </h2>
            <p className="text-lg" style={purpleTextStyle}>
              Welcome to Crab – the Next.js Sui Dapp. Connect your wallet to explore your assets.
            </p>
            <button onClick={() => navigate("/dashboard")}
                    className="flex items-center justify-center px-6 py-3 rounded-lg shadow-md font-semibold text-white transition duration-300"
                    style={{
                      minWidth: "200px",
                      height: "50px",
                      background: "linear-gradient(90deg, #9B5EFA 0%, #704BDF 100%)",
                      borderRadius: "12px"
                    }}>
              <span>LAUNCH APP</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                   stroke="currentColor" className="w-6 h-6 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5l6 6m0 0l-6 6m6-6H4.5"/>
              </svg>
            </button>
          </div>
        </main>

        <section
            className="mb-16 container mx-auto px-6 flex flex-col items-center"
            style={{marginTop: "400px"}} // 直接添加 marginTop 属性
        >
          <div style={{marginTop: "5%", marginBottom: "5%", textAlign: "center"}}>
            <h2 className="font-semibold mb-8" style={largeTitleStyle}>
              Key Features to Keep You Safe
            </h2>
          </div>
          <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
            {/* Token Recycling */}
            <div className="text-center md:w-1/3">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center">
                <img src={icon4} alt="Token Recycling"/>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={gradientStyle}>
                Token Recycling
              </h3>
              <p style={{...purpleTextStyle, lineHeight: 1.6}}>
                Turn losses into opportunities by recycling scam tokens and cleaning up
                the ecosystem.
              </p>
            </div>
            {/* Decentralized Governance */}
            <div className="text-center md:w-1/3">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center">
                <img src={icon3} alt="Decentralized Governance"/>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={gradientStyle}>
                Decentralized Governance
              </h3>
              <p style={{...purpleTextStyle, lineHeight: 1.6}}>
                Trust the process—community-driven decisions ensure fairness and
                transparency.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 mb-16 flex flex-col md:flex-row items-center gap-8 justify-center">
          {/* 左侧图片 */}
          <div className="w-full md:w-1/2 flex justify-end pr-8">
            <img
                src={icon1}
                alt="Abstract technology visualization"
                className="rounded-lg shadow-lg"
                style={{width: "365px", height: "274px"}}
            />
          </div>
          {/* 右侧文字 */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-2xl font-semibold mb-4" style={largeTitleStyle}>
              Who We Are
            </h2>
            <p style={{...purpleTextStyle, lineHeight: 1.8,width: "425px"}}>
              Crab is a hackathon project incubated within the Sui Blockchain
              Ecosystem. As part of an innovative competition, our team came together
              to create a platform that identifies and recycles phishing tokens,
              contributing to a safer and more transparent digital asset space. We hope
              to create a safer and more transparent digital asset space.
            </p>
          </div>
        </section>


      </div>
  );
};

export default HomePage;