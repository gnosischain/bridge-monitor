import styled from 'styled-components'
import { motion } from 'framer-motion'

const Magnifier: React.FC = () => (
  <svg fill="none" height="72" viewBox="0 0 72 72" width="72" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M33 57C46.2548 57 57 46.2548 57 33C57 19.7452 46.2548 9 33 9C19.7452 9 9 19.7452 9 33C9 46.2548 19.7452 57 33 57Z"
      stroke="#3E6957"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M63 63L49.95 49.95"
      stroke="#3E6957"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M41.4881 40.3303C41.5641 40.4063 41.6244 40.4966 41.6655 40.5959C41.7067 40.6952 41.7278 40.8017 41.7278 40.9092C41.7278 41.0167 41.7067 41.1231 41.6655 41.2225C41.6244 41.3218 41.5641 41.412 41.4881 41.4881C41.412 41.5641 41.3218 41.6244 41.2225 41.6655C41.1231 41.7067 41.0167 41.7278 40.9092 41.7278C40.8017 41.7278 40.6952 41.7067 40.5959 41.6655C40.4966 41.6244 40.4063 41.5641 40.3303 41.4881L33.5456 34.7023L26.7608 41.4881C26.6073 41.6416 26.399 41.7278 26.1819 41.7278C25.9648 41.7278 25.7566 41.6416 25.6031 41.4881C25.4495 41.3345 25.3633 41.1263 25.3633 40.9092C25.3633 40.6921 25.4495 40.4839 25.6031 40.3303L32.3889 33.5456L25.6031 26.7608C25.4495 26.6073 25.3633 26.399 25.3633 26.1819C25.3633 25.9648 25.4495 25.7566 25.6031 25.6031C25.7566 25.4495 25.9648 25.3633 26.1819 25.3633C26.399 25.3633 26.6073 25.4495 26.7608 25.6031L33.5456 32.3889L40.3303 25.6031C40.4839 25.4495 40.6921 25.3633 40.9092 25.3633C41.1263 25.3633 41.3345 25.4495 41.4881 25.6031C41.6416 25.7566 41.7278 25.9648 41.7278 26.1819C41.7278 26.399 41.6416 26.6073 41.4881 26.7608L34.7023 33.5456L41.4881 40.3303Z"
      fill="#3E6957"
    />
  </svg>
)

const Wrapper = styled.div`
  align-items: center;
  background-color: ${({ theme: { colors } }) => colors.darkestGrey};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${({ theme: { common } }) => common.space * 3}px;
  row-gap: ${({ theme: { common } }) => common.space * 2}px;
  text-align: center;
  width: 100%;
`

const Title = styled.h2`
  color: ${({ theme: { colors } }) => colors.cream};
  font-family: ${({ theme: { fonts } }) => fonts.family};
  font-size: 2rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;

  @media (min-width: ${({ theme: { breakPoints } }) => breakPoints.tabletPortraitStart}) {
    font-size: 2.6rem;
  }
`

const Description = styled.p`
  color: ${({ theme: { colors } }) => colors.cream};
  font-size: 1.4rem;
  font-weight: 400;
  line-height: 1.4;
  margin: 0;
`

export const NoResultsMessage: React.FC<{
  description?: string | React.ReactNode
  title: string
}> = ({ description, title, ...restProps }) => {
  return (
    <Wrapper
      animate={{ opacity: 1 }}
      as={motion.div}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      {...restProps}
    >
      <Magnifier />
      <Title>{title}</Title> {description && <Description>{description}</Description>}
    </Wrapper>
  )
}
