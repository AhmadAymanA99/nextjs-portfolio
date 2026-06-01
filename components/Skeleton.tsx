import styles from '../styles/Skeleton.module.css'

export function SkeletonLine({ width = '100%' }: { width?: string }) {
  return <div className={styles.line} style={{ width }} />
}

export function SkeletonBlock({ height = 200 }: { height?: number }) {
  return <div className={styles.block} style={{ height }} />
}

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <SkeletonLine width="40%" />
      <SkeletonLine width="100%" />
      <SkeletonLine width="80%" />
      <SkeletonBlock height={120} />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.statBox}>
            <SkeletonLine width="50%" />
            <SkeletonLine width="30%" />
          </div>
        ))}
      </div>
      <SkeletonBlock height={300} />
    </div>
  )
}
