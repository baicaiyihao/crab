import { ConnectButton } from "@mysten/dapp-kit";
import '../src/css/index.css'
import Upload from "./Page/upload.tsx";
import QueryDynamicFieldsAndImages from "../src/Page/GetTable.tsx"

function App() {

  return (
    <>
        <div className="walletButton">
            <ConnectButton />
        </div>
        <div><Upload /></div>
        <div className="div"><QueryDynamicFieldsAndImages/></div>
    </>
  );
}

export default App;
