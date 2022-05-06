import React from 'react'
import {Td, Text} from '@pancakeswap/uikit'

import {InputOutHis} from "../../hooks/hooks";

const outStr = (str:string) => {
    return str.length > 4 ? `${str.substring(0,4)}...${str.substring(str.length-4,str.length)}`: str
}
const FullRow: React.FC<{ order: InputOutHis }> = ({ order }) => {
  return (
    <tr>

      <Td>
        <Text fontSize="14px">{outStr(order.txid)}</Text>
      </Td>

      <Td>
          <Text fontSize="14px">{outStr(order.from)}</Text>
      </Td>

      <Td>
          <Text fontSize="14px">{outStr(order.toaddr)}</Text>
      </Td>

        <Td>
            <Text fontSize="14px">{outStr(order.value)}</Text>
        </Td>

        <Td>
          <Text fontSize="14px">{order.status}</Text>
      </Td>

    </tr>
  )
}

export default FullRow
