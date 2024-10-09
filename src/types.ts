import { Env as WarpcastEnv } from '@/services/warpcast/types'

export type Env = WarpcastEnv & {
  NODE_ENV: 'development' | 'production' | 'test'
}
