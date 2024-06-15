import Level from "./Level";
import Wrapper from "../assets/wrappers/LevelsContainer";
import { useLevelsContext } from "../pages/Levels";
import PageBtnContainer from "./PageBtnContainer";
import { Link } from "react-router-dom";

const LevelsContainer = () => {
  const { data } = useLevelsContext();

  const { levels, totalLevels, numOfPages } = data;
  if (levels.length === 0) {
    return (
      <Wrapper>
       <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h5>
         لا توجد مستويات لعرضها
        </h5>
        <Link
          to={`add-level`}
          className="btn edit-btn"
          style={{
            height: "60px",
            display: "flex",
            alignItems: "center",
          }}
        >
          إضافة مستوى
        </Link>
      </div>
      </Wrapper>
    );
  }
  return (
    <Wrapper>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <h5>
          {levels.length} {levels.length > 1} مستوى
        </h5>
        <Link
          to={`add-level`}
          className="btn edit-btn"
          style={{
            height: "42px",
            display: "flex",
            alignItems: "center",
          }}
        >
          إضافة مستوى
        </Link>
      </div>

      <div className="levels">
        {levels.map((level) => {
          return <Level key={level._id} level={level} />;
        })}
      </div>
      {numOfPages > 1 && <PageBtnContainer />}
    </Wrapper>
  );
};

export default LevelsContainer;
