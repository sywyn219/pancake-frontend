import {useState, useCallback, memo, useEffect} from 'react'
import { Flex, Card } from '@pancakeswap/uikit'

import OrderTab from './OrderTab'
import { ORDER_CATEGORY } from '../../types'

import CompactLimitOrderTable from './CompactLimitOrderTable'
import SpaciousLimitOrderTable from './SpaciousLimitOrderTable'
import Navigation from './TableNavigation'
import useActiveWeb3React from "../../../../hooks/useActiveWeb3React";
import {useIntOut} from "../../../../hooks/useContract";



const OrderTable: React.FC<{ isCompact: boolean; orderCategory: ORDER_CATEGORY }> = memo(
  ({ orderCategory, isCompact }) => {

      const { account} = useActiveWeb3React()

      const [orders,setOrders] = useState([])

      const inputOut = useIntOut()

      useEffect( () => {
          const fetchData  = async () => {
              let newOrders = []
              if (orderCategory === ORDER_CATEGORY.Open) {
                  newOrders = await inputOut.getInputsAddr(account)
              }else {
                  newOrders = await inputOut.getOutputsAddr(account)
              }
              console.log("newOrders---->",newOrders)
              setOrders(newOrders)
          }
          try {
              fetchData()
          } catch (e) {
              console.error('Error fetching history orders from subgraph', e)
          }
      },[account,orderCategory,isCompact])

    return (
      <Navigation data={orders} orderCategory={orderCategory}>
        {({ paginatedData }) =>
          isCompact ? (
            <CompactLimitOrderTable orders={paginatedData} />
          ) : (
            <SpaciousLimitOrderTable orders={paginatedData} />
          )
        }
      </Navigation>
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
