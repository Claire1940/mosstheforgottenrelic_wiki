import type { LucideIcon } from 'lucide-react'
import {
	BookOpen,
	CalendarClock,
	Monitor,
	Gamepad2,
	Star,
	Sparkles,
	Layers,
	Clapperboard,
} from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'guide' -> t('nav.guide')
	path: string // URL 路径，如 '/guide'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

// Moss: The Forgotten Relic 内容导航分类（与 content/<locale>/ 目录一一对应）
// 顺序按玩家需求排列：攻略 → 发售 → 平台 → 试玩 → 评测 → 特性 → 版本 → 资源
export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
	{ key: 'release', path: '/release', icon: CalendarClock, isContentType: true },
	{ key: 'platforms', path: '/platforms', icon: Monitor, isContentType: true },
	{ key: 'demo', path: '/demo', icon: Gamepad2, isContentType: true },
	{ key: 'reviews', path: '/reviews', icon: Star, isContentType: true },
	{ key: 'features', path: '/features', icon: Sparkles, isContentType: true },
	{ key: 'versions', path: '/versions', icon: Layers, isContentType: true },
	{ key: 'resources', path: '/resources', icon: Clapperboard, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/'

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
