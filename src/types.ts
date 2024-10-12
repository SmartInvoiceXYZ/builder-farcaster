import type { Env as BuilderEnv } from '@/services/builder/types'
import type { Env as WarpcastEnv } from '@/services/warpcast/types'

export type Env = BuilderEnv &
  WarpcastEnv & {
    NODE_ENV: 'development' | 'production' | 'test'
  }
