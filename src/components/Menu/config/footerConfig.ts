import { FooterLinkType } from '@pancakeswap/uikit'
import { ContextApi } from 'contexts/Localization/types'

export const footerLinks: (t: ContextApi['t']) => FooterLinkType[] = (t) => [
  {
    label: t('About'),
    items: [
      {
        label: t('Contact'),
        href: 'https://docs.goswap.top/contact-us',
        isHighlighted: true,
      },
      {
        label: t('Brand'),
        href: 'https://docs.goswap.top/brand',
      },
      {
        label: t('Blog'),
        href: 'https://medium.com/pancakeswap',
      },
      {
        label: t('Community'),
        href: 'https://docs.goswap.top/contact-us/telegram',
      },
      {
        label: t('CAKE token'),
        href: 'https://docs.goswap.top/tokenomics/cake',
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
        href: 'https://docs.goswap.top/contact-us/customer-support',
      },
      {
        label: t('Troubleshooting'),
        href: 'https://docs.goswap.top/help/troubleshooting',
      },
      {
        label: t('Guides'),
        href: 'https://docs.goswap.top/get-started',
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
        href: 'https://docs.goswap.top',
      },
      {
        label: t('Bug Bounty'),
        href: 'https://docs.goswap.top/code/bug-bounty',
      },
      {
        label: t('Audits'),
        href: 'https://docs.goswap.top/help/faq#is-pancakeswap-safe-has-pancakeswap-been-audited',
      },
      {
        label: t('Careers'),
        href: 'https://docs.goswap.top/hiring/become-a-chef',
      },
    ],
  },
]
