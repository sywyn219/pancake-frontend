import { Order } from '@gelatonetwork/limit-orders-lib'
import { Flex, ChevronRightIcon, Text, Box, useModal } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import {InputOutHis} from "../../hooks/hooks";
import {CopyButton} from "../../../../components/CopyButton";

interface CompactRowProps {
    order: InputOutHis
}
const space = "->"
const CompactRow: React.FC<CompactRowProps> = ({ order }) => {
    const { t } = useTranslation()

    return (
        <Flex width="100%" justifyContent="center" alignItems="center">
            <Box width="100%">
                <Flex mb="16px">
                    <ChevronRightIcon color="textSubtle" />
                </Flex>
                <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
                    {`${t('txid')} ${space} ${ order.txid}`}
                </Text>
                <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
                    {`${t('转出')} ${space} ${ order.from}`}
                </Text>
                <Flex>
                    <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
                        {`${t('转入')} ${space} ${ order.toaddr}`}
                    </Text>
                    <CopyButton width="24px" text={order.toaddr} tooltipMessage='Copied' tooltipTop={((order.id % 5)+1) *100+((order.id % 5)+1)*40} tooltipRight={100}/>
                </Flex>
                <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
                    {`${t('数量')} ${space} ${ order.value}`}
                </Text>
                <Text fontSize="12px" bold color={order.status === "等待" ? "primary":"textSubtle"} textTransform="uppercase">
                    {`${t('状态')} ${space} ${ order.status}`}
                </Text>
            </Box>
        </Flex>
    )
}

export default CompactRow