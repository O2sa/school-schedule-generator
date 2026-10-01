import Wrapper from '../assets/wrappers/LevelInfo';

const LevelInfo = ({ icon, text }) => {
  return (
    <Wrapper>
      <span className='level-icon'>{icon}</span>
      <span className='level-text'>{text}</span>
    </Wrapper>
  );
};
export default LevelInfo;
