import styled from 'styled-components';
import Wrapper from '../assets/wrappers/LandingPage';
import main from '../assets/images/main.svg';
import { Link } from 'react-router-dom';
import { Logo } from '../components';

const Landing = () => {
  return (
    <Wrapper>
      <nav>
        <Logo />
      </nav>
      <div className='container page'>
        <div className='info'>
          <h1>
            موقع  <span>المجدول</span> المدرسي 
          </h1>
          <p>
          </p>
          <Link to='/register' className='btn register-link'>
            إنشاء حساب
          </Link>
          <Link to='/login' className='btn '>
            تسجيل الدخول / استعراض المميزات
          </Link>
        </div>
        <img src={main} alt='job hunt' className='img main-img' />
      </div>
    </Wrapper>
  );
};

export default Landing;
