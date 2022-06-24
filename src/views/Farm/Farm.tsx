import React, {createContext, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import { useRouter } from 'next/router'
import Page from 'components/Layout/Page'
import {Button, Flex, Grid, Heading, Text, useMatchBreakpoints, useModal} from "@pancakeswap/uikit";
import styled from "styled-components";
import {AddressZero} from "@ethersproject/constants";
import {
    MENU_HEIGHT,
    MOBILE_MENU_HEIGHT,
    TOP_BANNER_HEIGHT,
    TOP_BANNER_HEIGHT_MOBILE
} from "@pancakeswap/uikit/src/widgets/Menu/config";
import {Currency, Trade} from "@pancakeswap/sdk";
import {BigNumber} from "@ethersproject/bignumber";
import {parseEther} from "@ethersproject/units";
import PageHeader from "../../components/PageHeader";
import {useTranslation} from "../../contexts/Localization";
import {useFarm} from "../../hooks/useContract";
import useActiveWeb3React from "../../hooks/useActiveWeb3React";
import {formatBigNumber} from "../../utils/formatBalance";
import SaleCard from "./SaleCard";
import {useCurrencyBalance} from "../../state/wallet/hooks";



const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
  ${({ theme }) => theme.mediaQueries.xxl} {
    margin-bottom: 0;
  }
`

const TextTitle = styled(Text)`
  font-size: 16px;
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 20px;
  }
  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 40px;
  }
`

const TextSubTitle = styled(Text)`
  font-size: 12px;
  ${({ theme }) => theme.mediaQueries.lg} {
    font-size: 16px;
  }
`
const Container = styled.div`
  position: sticky;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: auto;
  padding: 16px;
  z-index: 21;
  transition: top 0.2s;
  border-bottom: 1px ${({ theme }) => theme.colors.secondary} solid;
  border-left: 1px ${({ theme }) => theme.colors.secondary} solid;
  border-right: 1px ${({ theme }) => theme.colors.secondary} solid;
  border-radius: ${({ theme }) => `0 0 ${theme.radii.card} ${theme.radii.card}`};
  background: ${({ theme }) =>
    theme.isDark
        ? 'linear-gradient(360deg, rgba(49, 61, 92, 0.9) 0%, rgba(61, 42, 84, 0.9) 100%)'
        : 'linear-gradient(180deg, rgba(202, 194, 236, 0.9) 0%,  rgba(204, 220, 239, 0.9) 51.04%, rgba(206, 236, 243, 0.9) 100%)'};
  ${({ theme }) => theme.mediaQueries.xxl} {
    width: 1120px;
    padding: 24px 40px;
  }
  ${({ theme }) => theme.mediaQueries.xl} {
    flex-direction: row;
  }
`

// {/*<Button minWidth={isMobile ? '131px' : '178px'}>{t('购买')}</Button>*/}




const Farm: React.FC = ({ children }) => {

    const { t } = useTranslation()
    const { isMobile } = useMatchBreakpoints()
    const [stickPosition, setStickyPosition] = useState<number>(0)
    const chosenFarmsMemoized = useMemo(() => {
        return  []
    }, [
    ])
    const refPrevOffset = useRef(typeof window === 'undefined' ? 0 : window.pageYOffset)
    const router = useRouter()
    const {account } = useActiveWeb3React()
    const farmCon = useFarm()

    const [sale,setSale] = useState([])

    useEffect(() => {
        const scrollEffect = () => {
            const currentScroll = window.pageYOffset
            if (currentScroll <= 0) {
                setStickyPosition(0)
                return
            }
            if (currentScroll >= refPrevOffset.current) {
                setStickyPosition(0)
            } else {
                const warningBannerHeight = document.querySelector('.warning-banner')
                const topBannerHeight = isMobile ? TOP_BANNER_HEIGHT_MOBILE : TOP_BANNER_HEIGHT
                const topNavHeight = isMobile ? MENU_HEIGHT : MOBILE_MENU_HEIGHT
                const totalTopMenuHeight = warningBannerHeight ? topNavHeight + topBannerHeight : topNavHeight
                setStickyPosition(totalTopMenuHeight)
            }
            refPrevOffset.current = currentScroll
        }

        window.addEventListener('scroll', scrollEffect)
        return () => window.removeEventListener('scroll', scrollEffect)
    }, [isMobile])

    const [acc,setAcc] = useState<string>('')

    useEffect( () => {
        if (!account) {
            return
        }
        const fetchData  = async () => {
            const sales = await farmCon.getSale()
            let salesArr = sales.map(item => formatBigNumber(item))
            const saleArrSol = salesArr.sort((a, b) => (Number(a) > Number(b) ? 1 : -1));
            setSale(saleArrSol);
        }
        fetchData().catch((e) => {
            console.log("err---->",e)
        })

        const fetchAcc = async () => {
            setAcc('')
            const refAcc = await farmCon.users(account);
            if (refAcc.refAccount.isZero()) {
                if (!router.query.acc) {
                    return
                }
                const ac = router.query.acc as string
                if (ac === '') {
                    return
                }
                const addr  = await farmCon.accToAddr(BigNumber.from(ac))
                if (addr !== AddressZero) {
                    setAcc(ac)
                }
            }else {
                const acs = refAcc.refAccount.toString()
                setAcc(acs)
            }
        }
        fetchAcc().catch(e => {
            console.log("acc err-->",e)
        })

    },[account])


    const balance = useCurrencyBalance(account ?? undefined, Currency.ETHER)

    return (
        <FarmContext.Provider value={{ chosenFarmsMemoized }}>
            <PageHeader>
                <Heading as="h1" scale="xxl" color="secondary" mb="24px">
                    {t('农场资产')}
                </Heading>
                <Heading scale="lg" color="text">
                    {t('农场游戏资产销售')}
                </Heading>
            </PageHeader>

            <Container style={{ top: `${stickPosition}px` }}>
                <TextGroup>
                    <TextTitle bold>{t('购买农场NFT资产可产HSO收益.')}</TextTitle>
                    <TextSubTitle>{t('资产多，产币收益高.')}</TextSubTitle>
                </TextGroup>
            </Container>

            <Page>
                {sale && <Grid
                    gridGap="16px"
                    gridTemplateColumns={['1fr', '1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
                    mb="32px"
                    data-test="nft-collection-row"
                >
                    {sale.map((item,k) => {
                        return (
                            <SaleCard key={item} imgSrc="/images/farm/3.png">
                                <Flex alignItems="center"  justifyContent="space-between">
                                    <Text fontSize="14px">
                                        {t('价格:')}
                                    </Text>
                                    {`${item} HSO`}
                                </Flex>
                                <Flex alignItems="center"  justifyContent="space-between">
                                    <Text fontSize="14px">
                                        {t('余额:')}
                                    </Text>
                                    { balance ? `${balance.toSignificant(6).toString()} HSO`:`钱包未连接`}
                                </Flex>
                                <Flex alignItems="center"  justifyContent="space-between">
                                    <Text fontSize="14px">
                                        {t('邀请码:')}
                                    </Text>
                                    { acc !== '' ? acc : '无'}
                                </Flex>
                                <Button
                                    variant='primary'
                                    onClick={() => {
                                        if (acc === '') {
                                            console.log("acc is nil")
                                            return
                                        }
                                        farmCon.buy(BigNumber.from(k),BigNumber.from("1"),BigNumber.from(acc),{value:parseEther(item)})
                                    }}
                                    width="100%"
                                    id="swap-button"
                                    disabled ={!balance || balance.toSignificant(6) < item || acc === ''}
                                >
                                    {t('购买')}
                                </Button>
                            </SaleCard>
                        )
                    })}
                </Grid>}
            </Page>
        </FarmContext.Provider>
    )
}


export const FarmContext = createContext({ chosenFarmsMemoized: [] })

export default Farm
