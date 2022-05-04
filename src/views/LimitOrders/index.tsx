import { useCallback, useEffect, useState } from 'react'
import {CurrencyAmount, JSBI, Token, Trade} from '@pancakeswap/sdk'
import {Button, Box, Flex, useModal, useMatchBreakpoints, BottomDrawer, Link, Text} from '@pancakeswap/uikit'
import {toUtf8Bytes} from '@ethersproject/strings';

import { useTranslation } from 'contexts/Localization'
import Column, { AutoColumn } from 'components/Layout/Column'
import { AppBody } from 'components/App'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Footer from 'components/Menu/Footer'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useDefaultsFromURLSearch } from 'state/limitOrders/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { LIMIT_ORDERS_DOCS_URL } from 'config/constants'
import { Wrapper, StyledInputCurrencyWrapper, StyledSwapContainer } from './styles'
import Page from '../Page'
import LimitOrderTable from './components/LimitOrderTable'
import DepositWidthdrawTab from "./components/DepositWidthdrawTab";
import {mainnetTokens} from "../../config/constants/tokens";
import DepositWidthCurrency from "../../components/CurrencyInputPanel/DepositWidthCurrency";
import {useDerivedSwapInfo, useSwapActionHandlers, useSwapState} from "./hooks/hooks";
import { Field } from '../../state/swap/actions'
import {useCurrency} from "../../hooks/Tokens";
import useWrapCallback, {WrapType} from "../../hooks/useWrapCallback";
import shouldShowSwapWarning from "../../utils/shouldShowSwapWarning";
import {useIsTransactionUnsupported} from "../../hooks/Trades";
import {useIntOut} from "../../hooks/useContract";

import { ApprovalState, useApproveCallbackFromCurrency } from '../../hooks/useApproveCallback'
import {AutoRow, RowBetween} from "../../components/Layout/Row";
import CircleLoader from "../../components/Loader/CircleLoader";
import {useExpertModeManager, useUserSingleHopOnly, useUserSlippageTolerance} from "../../state/user/hooks";
import ConfirmSwapModal from "../Swap/components/ConfirmSwapModal";
import {GreyCard} from "../../components/Card";
import ProgressSteps from "../Swap/components/ProgressSteps";
import {SwapCallbackError} from "../Swap/components/styleds";
import confirmPriceImpactWithoutFee from "../Swap/components/confirmPriceImpactWithoutFee";
import {computeTradePriceBreakdown, warningSeverity} from "../../utils/prices";
import {useSwapCallback} from "../../hooks/useSwapCallback";


const LimitOrders = () => {
  // Helpers
  const { account } = useActiveWeb3React()
  const { t } = useTranslation()
  const { isMobile, isTablet } = useMatchBreakpoints()

  // TODO: use returned loadedUrlParams for warnings
  useDefaultsFromURLSearch()

  // TODO: fiat values
  const {
    independentField,
    typedValue,
    recipient,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const inputCurrency = useCurrency(mainnetTokens.usdt.address)

  const outputCurrency = useCurrency(outputCurrencyId)

  const {
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo(
      independentField,
      typedValue,
      inputCurrencyId,
      inputCurrency,
      outputCurrencyId,
      outputCurrency,
      recipient,
  )

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)


  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromCurrency(maxAmountInput)
  console.log("!swapInputError",!swapInputError,"approval",approval )

  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])


  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()

  const handleTypeInput = useCallback(
      (value: string) => {
        onUserInput(Field.INPUT, value)
      },
      [onUserInput],
  )

  const [active,setActive] = useState(0)

  const intout = useIntOut()

  const output = async ()=> {
    console.log("intout----------------_",await intout.widthdraw("1000000",toUtf8Bytes("aaaaaaaaaaaaaafew")))
  }

  const isValid = !swapInputError

  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT
  const trade = showWrap ? undefined : v2Trade

  const parsedAmounts = showWrap
      ? {[Field.INPUT]: parsedAmount}
      : {[Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount}



  // modal and loading
  const [{ tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
        ? parsedAmounts[independentField]?.toExact() ?? ''
        : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }


  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
      currencies[Field.INPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  )
  const noRoute = !route

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

  const handleCurrencyOut = useCallback(() => {
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
        .then((hash) => {
          setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: hash })
        })
        .catch((error) => {
          setSwapState({
            attemptingTxn: false,
            tradeToConfirm,
            swapErrorMessage: error.message,
            txHash: undefined,
          })
        })
  }, [swapCallback, tradeToConfirm, t])

  const showApproveFlow =
      !swapInputError &&
      (approval === ApprovalState.NOT_APPROVED ||
          approval === ApprovalState.PENDING ||
          (approvalSubmitted && approval === ApprovalState.APPROVED))

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn })
  }, [attemptingTxn, swapErrorMessage, trade, txHash])

  const [swapWarningCurrency, setSwapWarningCurrency] = useState(null)

  const handleInputSelect = useCallback(
      (currencyInput) => {
        setApprovalSubmitted(false) // reset 2 step UI for approvals
        onCurrencySelection(Field.INPUT, currencyInput)
        const showSwapWarning = shouldShowSwapWarning(currencyInput)
        if (showSwapWarning) {
          setSwapWarningCurrency(currencyInput)
        } else {
          setSwapWarningCurrency(null)
        }
      },
      [onCurrencySelection],
  )

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact())
    }
  }, [maxAmountInput, onUserInput])

  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  const [onPresentConfirmModal] = useModal(
      <ConfirmSwapModal
          trade={trade}
          originalTrade={tradeToConfirm}
          onAcceptChanges={handleAcceptChanges}
          attemptingTxn={attemptingTxn}
          txHash={txHash}
          recipient={recipient}
          allowedSlippage={allowedSlippage}
          onConfirm={handleCurrencyOut}
          swapErrorMessage={swapErrorMessage}
          customOnDismiss={handleConfirmDismiss}
      />,
      true,
      true,
      'confirmSwapModal',
  )


  return (
      <Page
          removePadding={false}
          hideFooterOnDesktop={false}
          noMinHeight
          helpUrl={LIMIT_ORDERS_DOCS_URL}
      >
        <Flex
            width="100%"
            justifyContent="center"
            position="relative"
            mb={null}
            mt={null}
        >
          {!isMobile && (
              <Flex width='50%' flexDirection="column">
                <Box width="100%">
                  <LimitOrderTable isCompact={isTablet} />
                </Box>
              </Flex>
          )}
          <Flex flexDirection="column" alignItems="center">
            <StyledSwapContainer $isChartExpanded={false}>
              <StyledInputCurrencyWrapper>
                <AppBody>
                  <DepositWidthdrawTab setActive={setActive} />
                  <Wrapper id="limit-order-page" style={{ minHeight: '412px' }}>
                    <AutoColumn gap="sm">
                      <DepositWidthCurrency
                          active={active}
                          value={formattedAmounts[Field.INPUT]}
                          label={independentField === Field.OUTPUT ? t('From (estimated)') : t('From')}
                          currency={currencies[Field.INPUT]}
                          onUserInput={handleTypeInput}
                          onMax={handleMaxInput}
                          onCurrencySelect={handleInputSelect}
                          otherCurrency={currencies[Field.OUTPUT]}
                          id="limit-order-currency-input"
                       />
                    </AutoColumn>
                    <Box mt="0.25rem">
                      {swapIsUnsupported ? (
                          <Button width="100%" disabled>
                            {t('Unsupported Asset')}
                          </Button>
                      ) : !account ? (
                          <ConnectWalletButton width="100%" />
                      ) : showWrap ? (
                          <Button width="100%" disabled={Boolean(wrapInputError)} onClick={onWrap}>
                            {wrapInputError ??
                                (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
                          </Button>
                      ) : showApproveFlow ? (
                          <RowBetween>
                            <Button
                                variant={approval === ApprovalState.APPROVED ? 'success' : 'primary'}
                                onClick={approveCallback}
                                disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                                width="48%"
                            >
                              {approval === ApprovalState.PENDING ? (
                                  <AutoRow gap="6px" justify="center">
                                    {t('Enabling')} <CircleLoader stroke="white" />
                                  </AutoRow>
                              ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                                  t('Enabled')
                              ) : (
                                  t('Enable %asset%', { asset: currencies[Field.INPUT]?.symbol ?? '' })
                              )}
                            </Button>
                            <Button
                                variant={isValid ? 'danger' : 'primary'}
                                onClick={() => {
                                  if ("isExpertMode") {
                                    handleCurrencyOut()
                                  } else {
                                    setSwapState({
                                      tradeToConfirm: trade,
                                      attemptingTxn: false,
                                      swapErrorMessage: undefined,
                                      txHash: undefined,
                                    })
                                    onPresentConfirmModal()
                                  }
                                }}
                                width="48%"
                                id="swap-button"
                                disabled={
                                    !isValid ||
                                    approval !== ApprovalState.APPROVED
                                }
                            >
                              {t('Swap..')}
                            </Button>
                          </RowBetween>
                      ) : (
                          <Button
                              variant={isValid && !swapCallbackError ? 'danger' : 'primary'}
                              onClick={() => {
                                if ("isExpertMode") {
                                  handleCurrencyOut()
                                } else {
                                  setSwapState({
                                    tradeToConfirm: trade,
                                    attemptingTxn: false,
                                    swapErrorMessage: undefined,
                                    txHash: undefined,
                                  })
                                  onPresentConfirmModal()
                                }
                              }}
                              id="swap-button"
                              width="100%"
                              disabled={!isValid  || !!swapCallbackError}
                          >
                            {swapInputError ||
                                ( t('Swap'))}
                          </Button>
                      )}
                      {showApproveFlow && (
                          <Column style={{ marginTop: '1rem' }}>
                            <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                          </Column>
                      )}
                      {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
                    </Box>
                  </Wrapper>
                </AppBody>
              </StyledInputCurrencyWrapper>
            </StyledSwapContainer>
            {isMobile && (
                <Flex mt="24px" width="100%">
                  <LimitOrderTable isCompact />
                </Flex>
            )}
            <Box display={['none', null, null, 'block']} width="100%" height="100%">
              <Footer variant="side" helpUrl={LIMIT_ORDERS_DOCS_URL} />
            </Box>
          </Flex>
        </Flex>
      </Page>
  )
}

export default LimitOrders