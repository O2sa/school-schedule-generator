import { Link, useRouteError } from 'react-router-dom';
import Wrapper from '../assets/wrappers/ErrorPage';
import img from '../assets/images/not-found.svg';
const Error = () => {
  const error = useRouteError();
  console.log(error);
  if (error.status === 404) {
    return (
      <Wrapper>
        <div>
          <img src={img} alt='not found' />
          <h3>معذرة! الصفحة غير موجودة</h3>
          <p>يبدو انه يتعذر الوصول للصفحة في الوقت الحالي</p>
          <Link to='/dashboard'>عودة إلى الرئيسية</Link>
        </div>
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <div>
        <h3>حدث خطأ ما...</h3>
      </div>
    </Wrapper>
  );
};
export default Error;
