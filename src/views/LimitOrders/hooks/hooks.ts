import {useDispatch, useSelector} from "react-redux";
import {useCallback, useMemo} from "react";
import {Currency, CurrencyAmount, ETHER, Token, Trade} from "@pancakeswap/sdk";
import {toUtf8Bytes} from "@ethersproject/strings";
import {Field, selectCurrency, setRecipient, switchCurrencies, typeInput} from "../../../state/swap/actions";
import useActiveWeb3React from "../../../hooks/useActiveWeb3React";
import {TranslateFunction, useTranslation} from "../../../contexts/Localization";
import useENS from "../../../hooks/ENS/useENS";
import {useCurrencyBalances} from "../../../state/wallet/hooks";
import tryParseAmount from "../../../utils/tryParseAmount";
import {useTradeExactIn, useTradeExactOut} from "../../../hooks/Trades";
import {useGasPrice, useUserSlippageTolerance} from "../../../state/user/hooks";
import {computeSlippageAdjustedAmounts} from "../../../utils/prices";

import {AppDispatch, AppState} from "../../../state";
import {useTransactionAdder} from "../../../state/transactions/hooks";
import isZero from "../../../utils/isZero";
import {calculateGasMargin, isAddress} from "../../../utils";
import truncateHash from "../../../utils/truncateHash";
import {SwapCallbackState} from "../../../hooks/useSwapCallback";
import {useIntOut} from "../../../hooks/useContract";
import {ORDER_CATEGORY} from "../types";
import orderBy from "lodash/orderBy";


export function useSwapState(): AppState['swap'] {
    return useSelector<AppState, AppState['swap']>((state) => state.swap)
}

export function useSwapActionHandlers(): {
    onCurrencySelection: (field: Field, currency: Currency) => void
    onSwitchTokens: () => void
    onUserInput: (field: Field, typedValue: string) => void
    onChangeRecipient: (recipient: string | null) => void
} {
    const dispatch = useDispatch<AppDispatch>()
    const onCurrencySelection = useCallback(
        (field: Field, currency: Currency) => {
            dispatch(
                selectCurrency({
                    field,
                    currencyId: currency instanceof Token ? currency.address : currency === ETHER ? 'HSO' : '',
                }),
            )
        },
        [dispatch],
    )

    const onSwitchTokens = useCallback(() => {
        dispatch(switchCurrencies())
    }, [dispatch])

    const onUserInput = useCallback(
        (field: Field, typedValue: string) => {
            dispatch(typeInput({ field, typedValue }))
        },
        [dispatch],
    )

    const onChangeRecipient = useCallback(
        (recipient: string | null) => {
            dispatch(setRecipient({ recipient }))
        },
        [dispatch],
    )

    return {
        onSwitchTokens,
        onCurrencySelection,
        onUserInput,
        onChangeRecipient,
    }
}


export function useDerivedSwapInfo(
    outAddr: string | undefined,
    independentField: Field,
    typedValue: string,
    inputCurrencyId: string | undefined,
    inputCurrency: Currency | undefined,
    outputCurrencyId: string | undefined,
    outputCurrency: Currency | undefined,
): {
    currencies: { [field in Field]?: Currency }
    currencyBalances: { [field in Field]?: CurrencyAmount }
    parsedAmount: CurrencyAmount | undefined
    v2Trade: Trade | undefined
    inputError?: string
} {
    const { account } = useActiveWeb3React()
    const { t } = useTranslation()

    const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
        inputCurrency ?? undefined,
        outputCurrency ?? undefined,
    ])
    const isExactIn: boolean = independentField === Field.INPUT
    const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

    const bestTradeExactIn = useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined)
    const bestTradeExactOut = useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined)

    const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

    const currencyBalances = {
        [Field.INPUT]: relevantTokenBalances[0],
        [Field.OUTPUT]: relevantTokenBalances[1],
    }

    const currencies: { [field in Field]?: Currency } = {
        [Field.INPUT]: inputCurrency ?? undefined,
        [Field.OUTPUT]: outputCurrency ?? undefined,
    }

    let inputError: string | undefined
    if (!account) {
        inputError = t('Connect Wallet')
    }

    if (!parsedAmount) {
        inputError = inputError ?? t('输入金额')
    }

    if (!outAddr) {
        inputError = inputError ?? t('输入提币地址')
    }

    // compare input balance to max input based on version
    const [balanceIn] = [
        currencyBalances[Field.INPUT]
    ]

    if (balanceIn && parsedAmount && balanceIn.lessThan(parsedAmount)) {
        inputError = t('Insufficient %symbol% balance', { symbol: parsedAmount.currency.symbol })
    }

    return {
        currencies,
        currencyBalances,
        parsedAmount,
        v2Trade: v2Trade ?? undefined,
        inputError,
    }
}


export enum OutCallbackState {
    INVALID,
    LOADING,
    VALID,
}

export function useInputOutCallback(amount:CurrencyAmount,outAddr:string) : { state: OutCallbackState; callback: null | (() => Promise<string>); error: string | null }  {

    const { account, chainId, library } = useActiveWeb3React()
    const gasPrice = useGasPrice()
    const { t } = useTranslation()
    const addTransaction = useTransactionAdder()

    const inputOut = useIntOut()
    return useMemo(() => {

        if (!library || !account || !chainId) {
            return { state: OutCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
        }

        return {
            state: OutCallbackState.VALID,
            callback: async function onOut(): Promise<string> {

                return  inputOut.widthdraw(amount.raw.toString(),toUtf8Bytes(outAddr))
                    .then((response: any) => {
                        return response.hash
                    })
                    .catch((error: any) => {
                        // if the user rejected the tx, pass this along
                        if (error?.code === 4001) {
                            throw new Error('Transaction rejected.')
                        } else {
                            // otherwise, the error was unexpected and we need to convey that
                            console.error(`Swap failed`, error)
                            throw new Error(t('Swap failed: %message%', { message: outErrorToUserReadableMessage(error, t) }))
                        }
                    })
            },
            error: null,
        }
    }, [amount,outAddr,library, account, chainId, gasPrice, t, addTransaction])
}

/**
 * This is hacking out the revert reason from the ethers provider thrown error however it can.
 * This object seems to be undocumented by ethers.
 * @param error an error from the ethers provider
 */
function outErrorToUserReadableMessage(error: any, t: TranslateFunction) {
    let reason: string | undefined
    while (error) {
        reason = error.reason ?? error.data?.message ?? error.message ?? reason
        // eslint-disable-next-line no-param-reassign
        error = error.error ?? error.data?.originalError
    }

    if (reason?.indexOf('execution reverted: ') === 0) reason = reason.substring('execution reverted: '.length)

    switch (reason) {
        case 'PancakeRouter: EXPIRED':
            return t(
                'The transaction could not be sent because the deadline has passed. Please check that your transaction deadline is not too low.',
            )
        case 'PancakeRouter: INSUFFICIENT_OUTPUT_AMOUNT':
        case 'PancakeRouter: EXCESSIVE_INPUT_AMOUNT':
            return t(
                'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.',
            )
        case 'TransferHelper: TRANSFER_FROM_FAILED':
            return t('The input token cannot be transferred. There may be an issue with the input token.')
        case 'Pancake: TRANSFER_FAILED':
            return t('The output token cannot be transferred. There may be an issue with the output token.')
        default:
            if (reason?.indexOf('undefined is not an object') !== -1) {
                console.error(error, reason)
                return t(
                    'An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading.',
                )
            }
            return t('Unknown error%reason%. Try increasing your slippage tolerance.', {
                reason: reason ? `: "${reason}"` : '',
            })
    }
}

