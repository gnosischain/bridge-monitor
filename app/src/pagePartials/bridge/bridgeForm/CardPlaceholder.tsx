import { SkeletonLoading } from '@/src/components/loading/SkeletonLoading'

export const CardPlaceholder: React.FC<{ height?: string }> = ({ height = '235px' }) => (
  <SkeletonLoading
    style={{
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      height: height,
      padding: '24px',
      rowGap: '16px',
    }}
  >
    <SkeletonLoading
      $animate={false}
      style={{
        borderRadius: '16px',
        height: '30px',
        width: '150px',
      }}
    />
    <SkeletonLoading
      $animate={false}
      style={{
        borderRadius: '16px',
        flexGrow: '1',
      }}
    />
  </SkeletonLoading>
)
