import { Flex, ChevronRightIcon, Text, Box, useModal } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import {BigNumber} from "ethers";
import {formatEther} from "@ethersproject/units";


interface CompactRowProps {
    order: {
        accs: BigNumber;
        addr: string;
        totalInvite: BigNumber;
        totalCoin: BigNumber;
        balance: BigNumber;
    }
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
                    {`${t('地址')} ${space} ${ order.addr}`}
                </Text>
                <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
                    {`${t('帐号')} ${space} ${ order.accs.toNumber()}`}
                </Text>
                <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
                    {`${t('业绩')} ${space} ${ order.totalCoin.toNumber()}`}
                </Text>
                <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
                    {`${t('用户数')} ${space} ${ order.totalInvite.toNumber()}`}
                </Text>
                <Text fontSize="12px" bold color="textSubtle" textTransform="uppercase">
                    {`${t('业绩奖励')} ${space} ${ formatEther(order.balance)} USDT`}
                </Text>
            </Box>
        </Flex>
    )
}

export default CompactRow