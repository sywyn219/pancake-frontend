import {useDispatch, useSelector} from "react-redux";
import {useCallback} from "react";
import {Currency, CurrencyAmount, ETHER, Token, Trade} from "@pancakeswap/sdk";
import {Field, selectCurrency, setRecipient, switchCurrencies, typeInput} from "../../../state/swap/actions";
import useActiveWeb3React from "../../../hooks/useActiveWeb3React";
import {useTranslation} from "../../../contexts/Localization";
import useENS from "../../../hooks/ENS/useENS";
import {useCurrencyBalances} from "../../../state/wallet/hooks";
import tryParseAmount from "../../../utils/tryParseAmount";
import {useTradeExactIn, useTradeExactOut} from "../../../hooks/Trades";
import {useUserSlippageTolerance} from "../../../state/user/hooks";
import {computeSlippageAdjustedAmounts} from "../../../utils/prices";

import {AppDispatch, AppState} from "../../../state";

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
    independentField: Field,
    typedValue: string,
    inputCurrencyId: string | undefined,
    inputCurrency: Currency | undefined,
    outputCurrencyId: string | undefined,
    outputCurrency: Currency | undefined,
    recipient: string,
): {
    currencies: { [field in Field]?: Currency }
    currencyBalances: { [field in Field]?: CurrencyAmount }
    parsedAmount: CurrencyAmount | undefined
    v2Trade: Trade | undefined
    inputError?: string
} {
    const { account } = useActiveWeb3React()
    const { t } = useTranslation()

    const recipientLookup = useENS(recipient ?? undefined)
    const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

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
        inputError = inputError ?? t('Enter an amount')
    }

    const [allowedSlippage] = useUserSlippageTolerance()

    const slippageAdjustedAmounts = v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage)

    // compare input balance to max input based on version
    const [balanceIn, amountIn] = [
        currencyBalances[Field.INPUT],
        slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null,
    ]

    if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
        inputError = t('Insufficient %symbol% balance', { symbol: amountIn.currency.symbol })
    }

    return {
        currencies,
        currencyBalances,
        parsedAmount,
        v2Trade: v2Trade ?? undefined,
        inputError,
    }
}