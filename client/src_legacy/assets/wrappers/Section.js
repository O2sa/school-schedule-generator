import styled from 'styled-components';

const Section = styled.section`
  margin-top: 4rem;
  h2 {
    text-transform: none;
  }
  & > h5 {
    margin-bottom: 1.5rem;
  }
  .levels {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 2rem;
  }
  @media (min-width: 1120px) {
    .levels {
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
  }
`;
export default Section;
