import defaultSettings from '@/settings'

const title = defaultSettings.title || '军校学员个人生活助手'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
