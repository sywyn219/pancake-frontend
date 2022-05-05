import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { Trade, TradeType } from '@pancakeswap/sdk'
import { Button, Text, AutoRenewIcon } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { Field } from 'state/swap/actions'
import {
    computeSlippageAdjustedAmounts,
    computeTradePriceBreakdown,
    formatExecutionPrice,
    warningSeverity,
} from 'utils/prices'
import { AutoColumn } from 'components/Layout/Column'
import QuestionHelper from 'components/QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from 'components/Layout/Row'
import FormattedPriceImpact from '../../Swap/components/FormattedPriceImpact'
import { StyledBalanceMaxMini, SwapCallbackError } from '../../Swap/components/styleds'

const SwapModalFooterContainer = styled(AutoColumn)`
  margin-top: 24px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.default};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-color: ${({ theme }) => theme.colors.background};
`

export default function OutModalFooter({
                                            trade,
                                            onConfirm,
                                            allowedSlippage,
                                            swapErrorMessage,
                                            disabledConfirm,
                                        }: {
    trade: Trade
    allowedSlippage: number
    onConfirm: () => void
    swapErrorMessage: string | undefined
    disabledConfirm: boolean
}) {
    const { t } = useTranslation()
    const [showInverted, setShowInverted] = useState<boolean>(false)
    const slippageAdjustedAmounts = useMemo(
        () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
        [allowedSlippage, trade],
    )
    const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
    const severity = warningSeverity(priceImpactWithoutFee)

    return (
        <>
            <AutoRow>
                <Button
                    variant={severity > 2 ? 'danger' : 'primary'}
                    onClick={onConfirm}
                    disabled={disabledConfirm}
                    mt="12px"
                    id="confirm-swap-or-send"
                    width="100%"
                >
                    {t('确认提币')}
                </Button>

                {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
            </AutoRow>
        </>
    )
}
