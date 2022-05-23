import {useWeb3React} from "@web3-react/core";
import {FarmContext, FarmPageLayout} from "../../views/Farm";

const FarmPage = () => {
    const { account } = useWeb3React()
    return (
        <>
           <h1>
               {account}
           </h1>
        </>
    )
}

FarmPage.Layout = FarmPageLayout

export default FarmPage