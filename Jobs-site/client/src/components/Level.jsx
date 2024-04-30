import { FaLocationArrow, FaBriefcase, FaCalendarAlt } from "react-icons/fa";
import { Link, Form } from "react-router-dom";
import Wrapper from "../assets/wrappers/Level";
import LevelInfo from "./LevelInfo";
import day from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
day.extend(advancedFormat);

const Level = ({
  _id,
  name,
  // company,
  dailyLectures,
  subjects,
}) => {
  // const date = day(createdAt).format("MMM Do, YYYY");
  return (
    <Wrapper>
      <header>
        <div className="main-icon">{name.charAt(0)}</div>
        <div className="info">
          <h5>{name}</h5>
          {/* <p>{company}</p> */}
        </div>
      </header>
      <div className="content">
        <div className="content-center">
          <LevelInfo icon={<FaLocationArrow />} text={`${dailyLectures} محاضرات يوميا`} />
          <LevelInfo icon={<FaCalendarAlt />} text={`${subjects.length} مواد`} />
          <div className={`status interview`}>{"نشظ"}</div>
        </div>
        <footer className="actions">
          <Link to={`level-info/${_id}`} className="btn edit-btn">
            استعراض
          </Link>
          <Form method="post" action={`delete-level/${_id}`}>
            <button type="submit" className="btn delete-btn">
              حذف
            </button>
          </Form>
        </footer>
      </div>
    </Wrapper>
  );
};
export default Level;
