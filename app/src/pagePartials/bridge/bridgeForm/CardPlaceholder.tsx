import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'

export const CardPlaceholder: React.FC = () => (
  <SkeletonLoading
    style={{
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      height: '148px',
      justifyContent: 'space-between',
      padding: '20px',
    }}
  >
    <SkeletonLoading
      $animate={false}
      style={{
        borderRadius: '999px',
        height: '12px',
        minHeight: '0',
        width: '64px',
      }}
    />
    <SkeletonLoading
      $animate={false}
      style={{
        borderRadius: '12px',
        height: '40px',
        width: '55%',
      }}
    />
    <SkeletonLoading
      $animate={false}
      style={{
        borderRadius: '999px',
        height: '12px',
        minHeight: '0',
        width: '40%',
      }}
    />
  </SkeletonLoading>
)
