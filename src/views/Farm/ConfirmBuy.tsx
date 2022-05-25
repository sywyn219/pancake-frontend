import {useCallback} from "react";
import {InjectedModalProps} from "@pancakeswap/uikit";
import {useTranslation} from "../../contexts/Localization";
import TransactionConfirmationModal, {TransactionErrorContent} from "../../components/TransactionConfirmationModal";

interface ConfirmBuyModalProps {
    attemptingTxn: boolean
    txHash?: string
    customOnDismiss?: () => void
    swapErrorMessage?: string
}

const ConfirmBuy: React.FC<InjectedModalProps & ConfirmBuyModalProps> = ({
    attemptingTxn,
    txHash,
    onDismiss,
    customOnDismiss,
    swapErrorMessage
    }) => {
    const { t } = useTranslation()

    const confirmationContent = useCallback(
        () => <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
    ,[onDismiss,swapErrorMessage])

    return (
        <TransactionConfirmationModal
            title={t('确认购买')}
            onDismiss={onDismiss}
            customOnDismiss={customOnDismiss}
            attemptingTxn={attemptingTxn}
            hash={txHash}
            content={ confirmationContent}
         pendingText="aaa"/>
    )
}

export default ConfirmBuy