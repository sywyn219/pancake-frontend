import { memo } from 'react'
import { Table, Th, Text } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import FullRow from './FullRow'
import {InputOutHis} from "../../hooks/hooks";

const SpaciousLimitOrderTable: React.FC<{orders: InputOutHis[]}> = ( props) => {
  const { t } = useTranslation()
  return (
    <Table>
      <>
        <thead>
          <tr>
            <Th>
              <Text fontSize="12px" bold textTransform="uppercase" color="textSubtle" textAlign="left">
                {t('TxID')}
              </Text>
            </Th>

            <Th>
              <Text fontSize="12px" bold textTransform="uppercase" color="textSubtle" textAlign="left">
                {t('转出')}
              </Text>
            </Th>

            <Th>
              <Text fontSize="12px" bold textTransform="uppercase" color="textSubtle" textAlign="left">
                {t('转入')}
              </Text>
            </Th>

            <Th>
              <Text fontSize="12px" bold textTransform="uppercase" color="textSubtle" textAlign="left">
                {t('数量')}
              </Text>
            </Th>

            <Th>
              <Text fontSize="12px" bold textTransform="uppercase" color="textSubtle" textAlign="left">
                {t('状态')}
              </Text>
            </Th>

          </tr>
        </thead>
        <tbody>
          {props.orders.map((order) => (
            <FullRow key={order.id} order={order} />
          ))}
        </tbody>
      </>
    </Table>
  )
}

export default memo(SpaciousLimitOrderTable)
