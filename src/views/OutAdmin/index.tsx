import {formatUnits} from "@ethersproject/units";
import {hexValue,arrayify} from "@ethersproject/bytes";
import {Base58} from "@ethersproject/basex";
import {memo, useCallback, useEffect, useState} from "react";
import {Text, Flex, Card} from '@pancakeswap/uikit'
import Page from "../Page";
import {ORDER_CATEGORY} from "../LimitOrders/types";

import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import {useIntOut} from "../../hooks/useContract";
import CompactLimitOrderTable from "./CompactLimitOrderTable";
import {InputOutHis} from "../LimitOrders/hooks/hooks";
import OrderTab from "../LimitOrders/components/LimitOrderTable/OrderTab";
import TableNavigation from "../LimitOrders/components/LimitOrderTable/TableNavigation";
import SpaciousLimitOrderTable from "../LimitOrders/components/LimitOrderTable/SpaciousLimitOrderTable";

const outStr = (str:string) => {
    return str.length > 10 ? `${str.substring(0,10)}...${str.substring(str.length-4,str.length)}`: str
}

const formatToOrders = (orders,isOut,changeStatus): InputOutHis[] => {

    const  newOrders: InputOutHis[] = []
    let inx = 0

    for (let i=orders.length-1; i>=0; i--) {
        const order = orders[i]
        const tx: InputOutHis = {
            id: 0,
            from: '',
            txid: '',
            toaddr: '',
            value: '',
            times: '',
            nonce: '',
            status: '',
            changeStatus: ''
        }
        tx.id = inx
        tx.txid = order.txid ? outStr(hexValue(order.txid)) : '0x'
        tx.times = new Date(order.times).toDateString()
        tx.value = formatUnits(order.value,6)
        tx.status = order.status ? order.status > 0 ? "成功" : "等待" : "成功"
        inx++
        if (isOut) {
            tx.nonce = order.nonce
            tx.from = order.fromaddr
            tx.toaddr = order.toaddr ? Base58.encode(order.toaddr) : '*'
        }else {
            tx.from = Base58.encode(order.from)
            tx.toaddr = order.toaddr
        }
        tx.changeStatus = changeStatus
        newOrders.push(tx)
    }

    return newOrders
}

const OrderTable: React.FC<{ isCompact: boolean; orderCategory: ORDER_CATEGORY }> = memo(
    ({ orderCategory, isCompact }) => {

        const { account} = useActiveWeb3React()

        const [orders,setOrders] = useState([])

        const inputOut = useIntOut()


        const changeStatus = async (from,txid,nonce) => {
            try {
                await inputOut.changeStatus(from,arrayify(txid),nonce)
            }catch (e) {
                console.log("e--->",e)
            }
        }
        useEffect( () => {
            if (!account) {
                return
            }
            const fetchData  = async () => {
                if (orderCategory === ORDER_CATEGORY.Open) {
                    const input = await inputOut.getAllinputs()
                    const  newOrders = formatToOrders(input,false,changeStatus)
                    setOrders(newOrders)
                }else {
                    const out = await inputOut.getAlloutputs()
                    const  newOrders = formatToOrders(out,true,changeStatus)
                    setOrders(newOrders)
                }
            }
            fetchData().catch((e) => {
                console.log("err---->",e)
            })
        },[account,orderCategory,isCompact])

        return (
            <TableNavigation data={orders} orderCategory={orderCategory}>
                {({ paginatedData }) =>
                    <CompactLimitOrderTable orders={paginatedData} />
                }
            </TableNavigation>
        )
    },
)

const OutAdmin = () => {

    const [activeTab, setIndex] = useState<ORDER_CATEGORY>(ORDER_CATEGORY.Open)
    const handleClick = useCallback((tabType: ORDER_CATEGORY) => setIndex(tabType), [])

    return  <Page
        removePadding={false}
        hideFooterOnDesktop={false}
        noMinHeight
    >
        <Flex flex="1" justifyContent="center">
            <Card style={{ width: '100%', height: 'max-content' }}>
                <OrderTab onItemClick={handleClick} activeIndex={activeTab} />
                <OrderTable orderCategory={activeTab} isCompact />
            </Card>
        </Flex>
    </Page>
}

export default OutAdmin