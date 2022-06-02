import { FooterLinkType } from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'

export const footerLinks: (t: ContextApi['t']) => FooterLinkType[] = (t) => [
  {
    label: t('About'),
    items: [
      {
        label: t('Contact'),
        href: 'https://docs.nftmint.info/contact-us',
        isHighlighted: true,
      },
      {
        label: t('Brand'),
        href: 'https://docs.nftmint.info/brand',
      },
      {
        label: t('Blog'),
        href: 'https://medium.com/pancakeswap',
      },
      {
        label: t('Community'),
        href: 'https://docs.nftmint.info/contact-us/telegram',
      },
      {
        label: t('CAKE token'),
        href: 'https://docs.nftmint.info/tokenomics/cake',
      },
      {
        label: '—',
      },
      {
        label: t('Online Store'),
        href: 'https://pancakeswap.creator-spring.com/',
      },
    ],
  },
  {
    label: t('Help'),
    items: [
      {
        label: t('Customer Support'),
        href: 'https://docs.nftmint.info/contact-us/customer-support',
      },
      {
        label: t('Troubleshooting'),
        href: 'https://docs.nftmint.info/help/troubleshooting',
      },
      {
        label: t('Guides'),
        href: 'https://docs.nftmint.info/get-started',
      },
    ],
  },
  {
    label: t('Developers'),
    items: [
      {
        label: 'Github',
        href: 'https://github.com/pancakeswap',
      },
      {
        label: t('Documentation'),
        href: 'https://docs.nftmint.info',
      },
      {
        label: t('Bug Bounty'),
        href: 'https://docs.nftmint.info/code/bug-bounty',
      },
      {
        label: t('Audits'),
        href: 'https://docs.nftmint.info/help/faq#is-pancakeswap-safe-has-pancakeswap-been-audited',
      },
      {
        label: t('Careers'),
        href: 'https://docs.nftmint.info/hiring/become-a-chef',
      },
    ],
  },
]
