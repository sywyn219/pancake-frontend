import {useState, useCallback, memo, useEffect} from 'react'
import { Flex, Card } from '@pancakeswap/uikit'
import {Base58} from '@ethersproject/basex'
import {formatUnits} from "@ethersproject/units";
import {hexValue} from "@ethersproject/bytes";
import OrderTab from './OrderTab'
import { ORDER_CATEGORY } from '../../types'

import CompactLimitOrderTable from './CompactLimitOrderTable'
import SpaciousLimitOrderTable from './SpaciousLimitOrderTable'
import TableNavigation from "./TableNavigation";
import useActiveWeb3React from "../../../../hooks/useActiveWeb3React";
import {useIntOut} from "../../../../hooks/useContract";
import {InputOutHis} from '../../hooks/hooks'


const outStr = (str:string) => {
    return str.length > 10 ? `${str.substring(0,10)}...${str.substring(str.length-4,str.length)}`: str
}

const formatToOrders = (orders,isOut): InputOutHis[] => {

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
            changeStatus: '',
        }
        tx.id = inx
        tx.times = new Date(order.times).toDateString()
        tx.value = formatUnits(order.value,6)
        tx.status = order.status ? order.status > 0 ? "成功" : "等待" : "成功"
        inx++
        if (isOut) {
            tx.txid = order.txid ? outStr(hexValue(order.txid)) : '*'
            tx.nonce = order.nonce
            tx.from = order.fromaddr
            tx.toaddr = order.toaddr ? Base58.encode(order.toaddr) : '*'
        }else {
            tx.txid = order.txid ? outStr(hexValue(order.txid)) : '0x'
            tx.from = Base58.encode(order.from)
            tx.toaddr = order.toaddr
        }
        newOrders.push(tx)
    }

    return newOrders
}

const OrderTable: React.FC<{ isCompact: boolean; orderCategory: ORDER_CATEGORY }> = memo(
  ({ orderCategory, isCompact }) => {

      const { account} = useActiveWeb3React()

      const [orders,setOrders] = useState([])

      const inputOut = useIntOut()

      useEffect( () => {
          if (!account) {
              return
          }
          const fetchData  = async () => {
              if (orderCategory === ORDER_CATEGORY.Open) {
                  const input = await inputOut.getInputsAddr(account)
                const  newOrders = formatToOrders(input,false)
                  setOrders(newOrders)
              }else {
                  const out = await inputOut.getOutputsAddr(account)
                  const  newOrders = formatToOrders(out,true)
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
          isCompact ? (
            <CompactLimitOrderTable orders={paginatedData} />
          ) : (
            <SpaciousLimitOrderTable orders={paginatedData} />
          )
        }
      </TableNavigation>
    )
  },
)

const LimitOrderTable: React.FC<{ isCompact: boolean }> = ({ isCompact }) => {
  const [activeTab, setIndex] = useState<ORDER_CATEGORY>(ORDER_CATEGORY.Open)
  const handleClick = useCallback((tabType: ORDER_CATEGORY) => setIndex(tabType), [])

  return (
    <Flex flex="1" justifyContent="center" mb="24px">
      <Card style={{ width: '100%', height: 'max-content' }}>
        <OrderTab onItemClick={handleClick} activeIndex={activeTab} />
        <OrderTable orderCategory={activeTab} isCompact={isCompact} />
      </Card>
    </Flex>
  )
}

export default memo(LimitOrderTable)
