import { IGuideStatus } from './guide.interface'

export const GUIDE_STATUS = Object.values(IGuideStatus)
export type GuideStatusType = (typeof GUIDE_STATUS)[number]
