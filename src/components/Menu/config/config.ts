import {
  MenuItemsType,
  DropdownMenuItemType,
  SwapIcon,
  SwapFillIcon,
  EarnFillIcon,
  EarnIcon,
  TrophyIcon,
  TrophyFillIcon,
  NftIcon,
  NftFillIcon,
  MoreIcon,
} from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'
import { nftsBaseUrl } from 'views/Nft/market/constants'
import { perpLangMap } from 'utils/getPerpetualLanguageCode'

export type ConfigMenuItemsType = MenuItemsType & { hideSubNav?: boolean }

const config: (t: ContextApi['t'], languageCode?: string) => ConfigMenuItemsType[] = (t, languageCode) => [
  {
    label: t('交易'),
    icon: SwapIcon,
    fillIcon: SwapFillIcon,
    href: '/swap',
    showItemsOnMobile: false,
    items: [
      {
        label: t('交易'),
        href: '/swap',
      },
      {
        label: t('跨链转账'),
        href: '/limit-orders',
      },
      {
        label: t('添加流动性'),
        href: '/liquidity',
      },
      {
        label: t('合约'),
        href: `https://perp.goswap.top/${perpLangMap(languageCode)}/futures/BTCUSDT`,
        type: DropdownMenuItemType.EXTERNAL_LINK,
      },
    ],
  },
  {
    label: t('农场'),
    href: '/farms',
    icon: EarnIcon,
    fillIcon: EarnFillIcon,
    showItemsOnMobile: false,
    items: [
      {
        label: t('Farms'),
        href: '/farms',
      },
      // {
      //   label: t('Pools'),
      //   href: '/pools',
      // },
    ],
  },
  {
    label: t('Win'),
    href: '/prediction',
    icon: TrophyIcon,
    fillIcon: TrophyFillIcon,
    items: [
      {
        label: t('Trading Competition'),
        href: '/competition',
      },
      {
        label: t('Prediction (BETA)'),
        href: '/prediction',
      },
      {
        label: t('Lottery'),
        href: '/lottery',
      },
    ],
  },
  {
    label: t('NFT'),
    href: `${nftsBaseUrl}`,
    icon: NftIcon,
    fillIcon: NftFillIcon,
    items: [
      {
        label: t('Overview'),
        href: `${nftsBaseUrl}`,
      },
      {
        label: t('Collections'),
        href: `${nftsBaseUrl}/collections`,
      },
      {
        label: t('Activity'),
        href: `${nftsBaseUrl}/activity`,
      },
    ],
  },
  {
    label: '',
    href: '/info',
    icon: MoreIcon,
    hideSubNav: true,
    items: [
      {
        label: t('Info'),
        href: '/info',
      },
      {
        label: t('IFO'),
        href: '/ifo',
      },
      {
        label: t('Voting'),
        href: '/voting',
      },
      {
        type: DropdownMenuItemType.DIVIDER,
      },
      {
        label: t('Leaderboard'),
        href: '/teams',
      },
      {
        type: DropdownMenuItemType.DIVIDER,
      },
      {
        label: t('Blog'),
        href: 'https://medium.com/pancakeswap',
        type: DropdownMenuItemType.EXTERNAL_LINK,
      },
      {
        label: t('Docs'),
        href: 'https://docs.goswap.top',
        type: DropdownMenuItemType.EXTERNAL_LINK,
      },
    ],
  },
]

export default config
