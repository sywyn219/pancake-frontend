import { useMemo } from 'react'
import { Trade, TradeType } from '@pancakeswap/sdk'
import { Button, Text, ErrorIcon, ArrowDownIcon } from '@pancakeswap/uikit'
import { Field } from 'state/swap/actions'
import { useTranslation } from 'contexts/Localization'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from 'utils/prices'
import { AutoColumn } from 'components/Layout/Column'
import { CurrencyLogo } from 'components/Logo'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import truncateHash from 'utils/truncateHash'
import { TruncatedText, SwapShowAcceptChanges } from '../../Swap/components/styleds'

export default function OutModalHeader({    outAddr,
                                            trade,
                                            allowedSlippage,
                                            recipient,
                                            showAcceptChanges,
                                            onAcceptChanges,
                                        }: {
    outAddr: string
    trade: Trade
    allowedSlippage: number
    recipient: string | null
    showAcceptChanges: boolean
    onAcceptChanges: () => void
}) {
    const { t } = useTranslation()
    const slippageAdjustedAmounts = useMemo(
        () => computeSlippageAdjustedAmounts(trade, allowedSlippage),
        [trade, allowedSlippage],
    )
    const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
    const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

    const amount =
        trade.tradeType === TradeType.EXACT_INPUT
            ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)
            : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)
    const symbol =
        trade.tradeType === TradeType.EXACT_INPUT ? trade.outputAmount.currency.symbol : trade.inputAmount.currency.symbol

    const tradeInfoText = t('请确认TRC20-USDT提币地址是否正确，输入错误无法找回.')

    const [estimatedText] = tradeInfoText.split(`${amount} ${symbol}`)

    const truncatedRecipient = recipient ? truncateHash(recipient) : ''

    const recipientInfoText = t('Output will be sent to %recipient%', {
        recipient: truncatedRecipient,
    })

    const [recipientSentToText, postSentToText] = recipientInfoText.split(truncatedRecipient)

    return (
        <AutoColumn gap="md">
            <RowBetween align="flex-end">
                <RowFixed gap="0px">
                    <CurrencyLogo currency={trade.inputAmount.currency} size="24px" style={{ marginRight: '12px' }} />
                    <TruncatedText
                        fontSize="24px"
                        color={showAcceptChanges && trade.tradeType === TradeType.EXACT_OUTPUT ? 'primary' : 'text'}
                    >
                        {trade.inputAmount.toSignificant(6)}
                    </TruncatedText>
                </RowFixed>
                <RowFixed gap="0px">
                    <Text fontSize="24px" ml="10px">
                        {trade.inputAmount.currency.symbol}
                    </Text>
                </RowFixed>
            </RowBetween>
            <RowFixed>
                <ArrowDownIcon width="16px" ml="4px" />
            </RowFixed>
            <RowBetween align="flex-end">
                <Text bold> {outAddr}</Text>
            </RowBetween>
            {showAcceptChanges ? (
                <SwapShowAcceptChanges justify="flex-start" gap="0px">
                    <RowBetween>
                        <RowFixed>
                            <ErrorIcon mr="8px" />
                            <Text bold> {t('Price Updated')}</Text>
                        </RowFixed>
                        <Button >{t('Accept')}</Button>
                    </RowBetween>
                </SwapShowAcceptChanges>
            ) : null}
            <AutoColumn justify="flex-start" gap="sm" style={{ padding: '24px 0 0 0px' }}>
                <Text small color="textSubtle" textAlign="left" style={{ width: '100%' }}>
                    {estimatedText}
                </Text>
            </AutoColumn>
            {recipient !== null ? (
                <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
                    <Text color="textSubtle">
                        {recipientSentToText}
                        <b title={recipient}>{truncatedRecipient}</b>
                        {postSentToText}
                    </Text>
                </AutoColumn>
            ) : null}
        </AutoColumn>
    )
}
