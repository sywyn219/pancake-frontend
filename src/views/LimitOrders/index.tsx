import { useCallback, useEffect, useState } from 'react'
import {CurrencyAmount, JSBI, Token, Trade} from '@pancakeswap/sdk'
import {Button, Box, Flex, useModal, useMatchBreakpoints, BottomDrawer, Link, Text} from '@pancakeswap/uikit'

import { useTranslation } from 'contexts/Localization'
import Column, { AutoColumn } from 'components/Layout/Column'
import { AppBody } from 'components/App'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Footer from 'components/Menu/Footer'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { LIMIT_ORDERS_DOCS_URL } from 'config/constants'
import { Wrapper, StyledInputCurrencyWrapper, StyledSwapContainer } from './styles'
import Page from '../Page'
import LimitOrderTable from './components/LimitOrderTable'
import DepositWidthdrawTab from "./components/DepositWidthdrawTab";
import {mainnetTokens} from "../../config/constants/tokens";
import DepositWidthCurrency from "../../components/CurrencyInputPanel/DepositWidthCurrency";
import {
  OutCallbackState,
  useDerivedSwapInfo,
  useInputOutCallback,
  useSwapActionHandlers,
  useSwapState
} from "./hooks/hooks";
import { Field } from '../../state/swap/actions'
import {useCurrency} from "../../hooks/Tokens";
import useWrapCallback, {WrapType} from "../../hooks/useWrapCallback";
import shouldShowSwapWarning from "../../utils/shouldShowSwapWarning";
import {useIsTransactionUnsupported} from "../../hooks/Trades";

import { ApprovalState, useApproveCallbackFromCurrency } from '../../hooks/useApproveCallback'
import {AutoRow, RowBetween} from "../../components/Layout/Row";
import CircleLoader from "../../components/Loader/CircleLoader";
import {useExpertModeManager, useUserSingleHopOnly, useUserSlippageTolerance} from "../../state/user/hooks";
import ProgressSteps from "../Swap/components/ProgressSteps";
import {SwapCallbackError} from "../Swap/components/styleds";
import ConfirmCurrencyOutModal from "./components/ConfirmCurrencyOut";
import {ORDER_CATEGORY} from "./types";


const LimitOrders = () => {
  // Helpers
  const { account } = useActiveWeb3React()
  const { t } = useTranslation()
  const { isMobile, isTablet } = useMatchBreakpoints()

  // TODO: fiat values
  const {
    independentField,
    typedValue,
    recipient,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()

  const inputCurrency = useCurrency(mainnetTokens.usdt.address)
  const outputCurrency = useCurrency("HSO")

  const [outAddr,setOutAddr] = useState('')

  const {
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError,
  } = useDerivedSwapInfo(
      outAddr,
      independentField,
      typedValue,
      inputCurrencyId,
      inputCurrency,
      outputCurrencyId,
      outputCurrency,
  )

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)


  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromCurrency(maxAmountInput)

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

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // the callback to execute the out
  const { callback: outCallbackState, error: outErrorToUserReadableMessage} = useInputOutCallback(parsedAmount,outAddr)

  const handleCurrencyOut = useCallback(() => {
    if (!outCallbackState) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
    outCallbackState()
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
  }, [outCallbackState, tradeToConfirm, t])

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
      <ConfirmCurrencyOutModal
          outAddr={outAddr}
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
                          outAddr={outAddr}
                          setOutAddr={setOutAddr}
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
                      ) : active ===  ORDER_CATEGORY.Open ? <></> : showWrap ? (
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
                                  t('批准')
                              ) : (
                                  t('批准 %asset%', { asset: currencies[Field.INPUT]?.symbol ?? '' })
                              )}
                            </Button>
                            <Button
                                variant={isValid ? 'danger' : 'primary'}
                                onClick={() => {
                                  if (false) {
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
                              {t('提币')}
                            </Button>
                          </RowBetween>
                      ) : (
                          <Button
                              variant={isValid && !outErrorToUserReadableMessage ? 'danger' : 'primary'}
                              onClick={() => {
                                if (false) {
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
                              disabled={!isValid  || !!outErrorToUserReadableMessage}
                          >
                            {swapInputError ||
                                ( t('提币'))}
                          </Button>
                      )}
                      {active ===  ORDER_CATEGORY.Open ? <></> : showApproveFlow && (
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