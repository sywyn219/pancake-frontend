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
    label: t('铸造NFT'),
    icon: SwapIcon,
    fillIcon: SwapFillIcon,
    href: '/mint-nft',
    showItemsOnMobile: false,
    items: [
    ],
  },
  {
    label: t('我的NFT'),
    href: '/my',
    icon: EarnIcon,
    fillIcon: EarnFillIcon,
    showItemsOnMobile: false,
    items: [
    ],
  },
]

export default config
