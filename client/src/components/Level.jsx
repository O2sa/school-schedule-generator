import { FaLocationArrow, FaBriefcase, FaCalendarAlt } from "react-icons/fa";
import { Link, Form } from "react-router-dom";
import Wrapper from "../assets/wrappers/Level";
import LevelInfo from "./LevelInfo";
import day from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
day.extend(advancedFormat);

const Level = ({
  level
}) => {
  // const date = day(createdAt).format("MMM Do, YYYY");
  return (
    <Wrapper>
      <header>
        <div className="main-icon">{level.name.charAt(0)}</div>
        <div className="info">
          <h5>{level.name}</h5>
          {/* <p>{company}</p> */}
        </div>
      </header>
      <div className="content">
        <div className="content-center">
          <LevelInfo icon={<FaLocationArrow />} text={`${level.dailyLectures} محاضرات يوميا`} />
          <LevelInfo icon={<FaCalendarAlt />} text={`${level.subjects.length} مواد`} />
          <div className={`status interview`}>{`المرحلة ${level.stage}`}</div>
        </div>
        <footer className="actions">
          <Link to={`level-info/${level._id}`} className="btn edit-btn">
            استعراض
          </Link>
          <Form method="post" action={`delete-level/${level._id}`}>
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
