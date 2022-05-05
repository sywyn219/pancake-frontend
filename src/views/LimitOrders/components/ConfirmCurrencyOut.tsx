import { useCallback, useMemo } from 'react'
import { currencyEquals, Trade } from '@pancakeswap/sdk'
import {Box, InjectedModalProps} from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import styled from "styled-components";

import TransactionConfirmationModal, {
    TransactionErrorContent,
} from 'components/TransactionConfirmationModal'

import SwapModalHeader from '../../Swap/components/SwapModalHeader'
import OutModalHeader from "./OutModalHeader";
import OutModalFooter from "./OutModealFooter";
import SwapModalFooter from "../../Swap/components/SwapModalFooter";


/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: Trade, tradeB: Trade): boolean {
    return (
        tradeA.tradeType !== tradeB.tradeType ||
        !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
        !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
        !currencyEquals(tradeA.outputAmount.currency, tradeB.outputAmount.currency) ||
        !tradeA.outputAmount.equalTo(tradeB.outputAmount)
    )
}
interface ConfirmSwapModalProps {
    outAddr: string
    trade?: Trade
    originalTrade?: Trade
    attemptingTxn: boolean
    txHash?: string
    recipient: string | null
    allowedSlippage: number
    onAcceptChanges: () => void
    onConfirm: () => void
    swapErrorMessage?: string
    customOnDismiss?: () => void
}

const Wrapper = styled.div`
  width: 100%;
`

const ConfirmOutModalContent = ({topContent,
                                    bottomContent,
                                }: {
    topContent: () => React.ReactNode
    bottomContent: () => React.ReactNode
}) => {
    return (
        <Wrapper>
            <Box>{topContent()}</Box>
            <Box>{bottomContent()}</Box>
        </Wrapper>
    )
}

const ConfirmCurrencyOutModal: React.FC<InjectedModalProps & ConfirmSwapModalProps> = ({
                                                                                    outAddr,
                                                                                    trade,
                                                                                    originalTrade,
                                                                                    onAcceptChanges,
                                                                                    allowedSlippage,
                                                                                    onConfirm,
                                                                                    onDismiss,
                                                                                    customOnDismiss,
                                                                                    recipient,
                                                                                    swapErrorMessage,
                                                                                    attemptingTxn,
                                                                                    txHash,
                                                                                }) => {
    const showAcceptChanges = useMemo(
        () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
        [originalTrade, trade],
    )
    const { t } = useTranslation()

    const modalHeader = useCallback(() => {
        return trade ? (<OutModalHeader
            outAddr={outAddr}
            trade={trade}
            allowedSlippage={allowedSlippage}
            recipient={recipient}
            showAcceptChanges={showAcceptChanges}
            onAcceptChanges={onAcceptChanges}
        />) : null
    }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade,outAddr])

    const modalBottom = useCallback(() => {
        return trade ? (<OutModalFooter
            trade={trade}
            onConfirm={onConfirm}
            disabledConfirm={showAcceptChanges}
            swapErrorMessage={swapErrorMessage}
            allowedSlippage={allowedSlippage}
        />) : null
    }, [allowedSlippage, onConfirm, showAcceptChanges, swapErrorMessage, trade,outAddr])

    // text to show while loading
    const pendingText = t(outAddr)

    const confirmationContent = useCallback(
        () =>
            swapErrorMessage ? (
                <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
            ) : (
                <ConfirmOutModalContent topContent={modalHeader} bottomContent={modalBottom} />
            ),
        [onDismiss, modalBottom, modalHeader, swapErrorMessage],
    )

    return (
        <TransactionConfirmationModal
            title={t('确认提币')}
            onDismiss={onDismiss}
            customOnDismiss={customOnDismiss}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            content={confirmationContent}
            pendingText={pendingText}
            currencyToAdd={trade?.outputAmount.currency}
        />
    )
}

export default ConfirmCurrencyOutModal
