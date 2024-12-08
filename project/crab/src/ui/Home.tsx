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
  fontSize: "3.5rem", // 增大字体大小，可以根据需要调整
  lineHeight: 1.2 // 调整行高以适应新的字体大小
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-cover bg-center" style={{ backgroundImage: "url('../assets/home/background.jpg')" }}>
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center lg:items-start mt-[168px]" style={{ paddingLeft: "20px" }}>
        {/* 左侧文字 */}
        <div className="flex flex-col space-y-6 items-start" style={{ maxWidth: "1200px" }}>
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight" style={gradientStyle}>
            Clear Bad Assets,<br />
            Unlock a Smarter Digital World
          </h2>
          <p className="text-lg" style={purpleTextStyle}>
            Welcome to Crab – the Next.js Sui Dapp. Connect your wallet to explore your assets.
          </p>
          <button onClick={() => navigate("/dashboard")} className="flex items-center justify-center px-6 py-3 rounded-lg shadow-md font-semibold text-white transition duration-300" style={{ minWidth: "200px", height: "50px", background: "linear-gradient(90deg, #9B5EFA 0%, #704BDF 100%)", borderRadius: "12px" }}>
            <span>LAUNCH APP</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 ml-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5l6 6m0 0l-6 6m6-6H4.5" />
            </svg>
          </button>
        </div>
      </main>

      <section className="mb-16 container mx-auto px-6">
        <div style={{ marginTop: "20%", marginBottom: "10%" }}>
          <h2 className="font-semibold text-center mb-8" style={largeTitleStyle}>Key Features to Keep You Safe</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Container for Token Recycling and Decentralized Governance */}
          <div style={{ marginLeft: "20%" }}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                <img src={icon4} alt="Token Recycling" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={gradientStyle}>Token Recycling</h3>
              <p style={purpleTextStyle}>
                Turn losses into opportunities by recycling<br /> scam tokens and cleaning up the ecosystem.
              </p>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                <img src={icon3} alt="Decentralized Governance" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={gradientStyle}>Decentralized Governance</h3>
              <p style={purpleTextStyle}>
                Trust the process—community-driven<br /> decisions ensure fairness and transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "10%", marginTop: "5%" }} className="flex flex-col md:flex-row items-center gap-8 container mx-auto px-6 mb-16">
        <div style={{ width: 365, height: 274, marginLeft: "24%", marginTop: "5%" }} className="w-full md:w-1/2">
          <img src={icon1} alt="Abstract technology visualization" className="rounded-lg shadow-lg" />
        </div>
        <div style={{ marginTop: "3%", marginLeft: "5%" }} className="w-full md:w-1/2">
          <h2 className="text-2xl font-semibold mb-4" style={largeTitleStyle}>Who We Are</h2>
          <p style={purpleTextStyle}>
            Crab is a hackathon project incubated within<br />
            the Sui Blockchain Ecosystem. As part of an<br />
            innovative competition, our team came together<br />
            to create a platform that identifies and recycles<br />
            phishing tokens, contributing to a safer and<br />
            more transparent digital asset space. We hope<br />
            to create a safer and more transparent digital<br />
            asset space.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;