import {Currency, Pair} from "@pancakeswap/sdk";
import { Button, ChevronDownIcon, Text, useModal, Flex, Box, MetamaskIcon } from '@pancakeswap/uikit'
import useActiveWeb3React from "../../../hooks/useActiveWeb3React";
import styled from "styled-components";
import CurrencySearchModal from "../../../components/SearchModal/CurrencySearchModal";
import {CurrencyLogo, DoubleCurrencyLogo} from "../../../components/Logo";


const CurrencySelectButton = styled(Button).attrs({ variant: 'text', scale: 'sm' })`
  padding: 0 0.5rem;
`

interface CurrencyInputPanelProps {
    onMax?: () => void
    showMaxButton: boolean
    label?: string
    onCurrencySelect: (currency: Currency) => void
    currency?: Currency | null
    disableCurrencySelect?: boolean
    hideBalance?: boolean
    otherCurrency?: Currency | null
    id: string
    showCommonBases?: boolean
}

export default function DepositWidthCurrency({
    onMax,
    showMaxButton,
    label,
    onCurrencySelect,
    currency,
    disableCurrencySelect = false,
    hideBalance = false,
    otherCurrency,
    id,
    showCommonBases,
}: CurrencyInputPanelProps) {
    const { account, library } = useActiveWeb3React()

    const [onPresentCurrencyModal] = useModal(
        <CurrencySearchModal
            onCurrencySelect={onCurrencySelect}
            selectedCurrency={currency}
            otherSelectedCurrency={otherCurrency}
            showCommonBases={showCommonBases}
        />,
    )
    return (
        <Box position="relative" id={id}>
            <Flex mb="6px" alignItems="center" justifyContent="space-between">
                <Flex>
                    <CurrencySelectButton
                        className="open-currency-select-button"
                        selected={!!currency}
                        onClick={() => {
                            if (!disableCurrencySelect) {
                                onPresentCurrencyModal()
                            }
                        }}
                    >
                        <Flex alignItems="center" justifyContent="space-between">
                            {pair ? (
                                <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} size={16} margin />
                            ) : currency ? (
                                <CurrencyLogo currency={currency} size="24px" style={{ marginRight: '8px' }} />
                            ) : null}
                            {pair ? (
                                <Text id="pair" bold>
                                    {pair?.token0.symbol}:{pair?.token1.symbol}
                                </Text>
                            ) : (
                                <Text id="pair" bold>
                                    {(currency && currency.symbol && currency.symbol.length > 20
                                        ? `${currency.symbol.slice(0, 4)}...${currency.symbol.slice(
                                            currency.symbol.length - 5,
                                            currency.symbol.length,
                                        )}`
                                        : currency?.symbol) || t('Select a currency')}
                                </Text>
                            )}
                            {!disableCurrencySelect && <ChevronDownIcon />}
                        </Flex>
                    </CurrencySelectButton>
                </Flex>
            </Flex>
        </Box>
    )
}