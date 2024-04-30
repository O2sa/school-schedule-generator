import { useRouteError } from 'react-router-dom';

const ErrorElement = () => {
  const error = useRouteError();
  console.log(error);
  return <h4>حدث خطأ ما...</h4>;
};
export default ErrorElement;
