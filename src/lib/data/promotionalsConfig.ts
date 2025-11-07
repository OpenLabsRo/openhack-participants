import type { ComponentType } from 'svelte'
import { Gift as DefaultIcon } from '@lucide/svelte'
import { resolveApiBase } from '$lib/api/apiBase.js'

export interface PromotionalService {
  name: string
  icon: any // ComponentType for Lucide icons, or string path for images
  color?: string // Only used for Lucide icons
  isImage?: boolean // True if icon is an image path, false if Lucide component
  showModal?: boolean // True if this service should show a promotional code modal instead of opening a link
}

export const promotionalsMap: Record<string, PromotionalService> = {
  gcp: {
    name: 'GCP',
    icon: '/icons/gcp.svg',
    isImage: true,
  },
  elevenlabs: {
    name: 'ElevenLabs',
    icon: '/icons/elevenlabs.svg',
    isImage: true,
  },
  vmax: {
    name: 'Vmax',
    icon: '/icons/vmax.png',
    isImage: true,
  },
  blue: {
    isImage: true,
    icon: 'icons/blue.png',
    name: 'Blue',
    showModal: true,
  },
  framer: {
    isImage: true,
    icon: 'icons/framer.svg',
    name: 'Framer',
    showModal: true,
  },
  linearity: {
    isImage: true,
    icon: 'icons/linearity.svg',
    name: 'Linearity',
  },
  mobbin: {
    isImage: true,
    icon: 'icons/mobbin.svg',
    name: 'Mobbin',
    showModal: true,
  },
  raycast: {
    isImage: true,
    icon: 'icons/raycast.svg',
    name: 'Raycast',
    showModal: true,
  },
}

/**
 * Gets the base URL for constructing voucher links
 * Format: http://DOMAIN/accounts/vouchers/$SERVICE/$PROMOTIONAL
 */
export function getVouchersBaseUrl(): string {
  const apiBase = resolveApiBase()
  // Remove trailing slash if present
  const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
  return `${base}/accounts/vouchers`
}

/**
 * Constructs a full voucher URL for a given service and promotional index
 */
export function getVoucherUrl(
  serviceName: string,
  promotionalIndex: string
): string {
  return `${getVouchersBaseUrl()}/${serviceName}/${promotionalIndex}`
}

export function getPromotionalConfig(serviceName: string): PromotionalService {
  return (
    promotionalsMap[serviceName.toLowerCase()] || {
      name: serviceName,
      icon: DefaultIcon,
      color: 'text-amber-400',
      isImage: false,
      showModal: true, // Show promotional code modal for services not explicitly configured
    }
  )
}
