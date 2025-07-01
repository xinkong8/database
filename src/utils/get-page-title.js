import defaultSettings from '@/settings'

const title = defaultSettings.title || '个人生活管理助手'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
