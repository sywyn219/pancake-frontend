import React, {FC, useEffect, useState} from 'react'
import {Button, Flex, Heading, Text} from "@pancakeswap/uikit";
import {BigNumber} from "@ethersproject/bignumber";
import {formatEther, parseEther} from "@ethersproject/units";
import Page from 'components/Layout/Page'
import PageHeader from "../../components/PageHeader";
import {useTranslation} from "../../contexts/Localization";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import SaleCard from "../Farm/SaleCard";
import {useFarm} from "../../hooks/useContract";
import {useCurrentBlock} from "../../state/block/hooks";
import {CopyButton} from "../../components/CopyButton";



export const MiningPageLayout: FC = ({ children }) => {
    const { t } = useTranslation()
    const {account } = useActiveWeb3React()
    const farmCon = useFarm()
    const [amount,setAmount] = useState('')
    const currentBlock = useCurrentBlock()
    const [accLink,setAccLink] = useState('')
    const [balance,setBalance]  = useState('')

    useEffect( () => {
        if (!account) {
            return
        }
        const fetchAmount = async () => {
            const amt = await farmCon.calcMiningAmount(account);
            setAmount(formatEther(amt));
        }
        fetchAmount().catch(e => console.log("get amt err-->",e))

        const fetchAcc = async () => {
            const pUser = await farmCon.pUser(account);
            if (!pUser.account.isZero()) {
                setAccLink(`https://goswap.top/farm?acc=${pUser.account.toString()}`)
            }
            setBalance(formatEther(pUser.balance))
        }
        fetchAcc().catch(e => console.log("get acc is err-->",e))

    },[account,currentBlock])

    return (
        <>
            <PageHeader>
                <Heading scale="lg" color="text">
                    {t('农场资产 挖矿产币中')}
                </Heading>
            </PageHeader>
            <Page>
                <SaleCard imgSrc="/images/farm/3.png">
                    <Flex alignItems="center"  justifyContent="space-between" marginTop="14px">
                        <Text fontSize="14px">
                            {t('产币可提:')}
                        </Text>
                        {`${amount} HSO`}
                    </Flex>
                    <Button
                        marginTop="16px"
                        variant='primary'
                        onClick={() => {
                            farmCon.widthDrawHSO()
                        }}
                        width="100%"
                        id="swap-button"
                        disabled ={!account || amount === '0.00'}
                    >
                        {t('提币')}
                    </Button>
                    <Text fontSize="14px" marginTop='26px'>
                        {t('邀请链接:')}
                    </Text>
                    {accLink}
                    <CopyButton width="24px" text={accLink} tooltipMessage='Copied' tooltipTop={120} />

                </SaleCard>
            </Page>
        </>
    )
}