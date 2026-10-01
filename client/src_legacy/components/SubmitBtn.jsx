import { useNavigation } from 'react-router-dom';
const SubmitBtn = ({ formBtn, onClick }) => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  return (
    <button
      type='submit'
      className={`btn btn-block ${formBtn && 'form-btn'} `}
      onClick={onClick}
      disabled={isSubmitting}
    >
      {isSubmitting ? 'يتم الحفظ' : 'حفظ'}
    </button>
  );
};
export default SubmitBtn;
