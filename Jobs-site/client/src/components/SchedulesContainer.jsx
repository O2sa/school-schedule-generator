import Schedule from "./Schedule";
import Wrapper from "../assets/wrappers/SchedulesContainer";
import { useSchedulesContext } from "../pages/Schedules";
import PageBtnContainer from "./PageBtnContainer";

const SchedulesContainer = () => {
  const { data } = useSchedulesContext();

  const { schedules, totalSchedules } = data;
  if (schedules.length === 0) {
    return (
      <Wrapper>
        <h2>لا يوجد جداول لعرضها...</h2>
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <h4>
        {totalSchedules} جدول  {schedules.length > 1}
      </h4>
      <div className="schedules">
        {schedules.map((schedule) => (
          <div style={{ marginBottom: "50px", marginTop: "50px" }}>
            <h5 style={{ margin: "30px" }}>{schedule.name}</h5>
            <Schedule key={schedule.schedule._id} schedule={schedule} />
          </div>
        ))}
      </div>
      {/* {numOfPages > 1 && <PageBtnContainer />} */}
    </Wrapper>
  );
};
export default SchedulesContainer;
