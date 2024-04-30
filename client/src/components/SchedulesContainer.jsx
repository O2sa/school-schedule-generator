import Schedule from "./Schedule";
import Wrapper from "../assets/wrappers/SchedulesContainer";
import { useSchedulesContext } from "../pages/Schedules";
import PageBtnContainer from "./PageBtnContainer";
import {
  DAYS_OF_WEEK_EN,
  NUMS_ST,
  OFF_LECTURES,
  WEEK_DAYS,
} from "../../../utils/constants";
import { Box, Text } from "@mantine/core";

const examData = {
  mon: [
    { level: "1_level", subject: "math", time: 1 },
    { level: "1_level", subject: "math", time: 2 },
  ],
  wed: [
    { level: "1_level", subject: "math", time: 3 },
    { level: "1_level", subject: "math", time: 4 },
    { level: "1_level", subject: "math", time: 5 },
  ],
};

const SchedulesContainer = () => {
  const { data } = useSchedulesContext();

  const { schedules, totalSchedules, levels } = data;
  // console.log("levels", levels);
  if (schedules.length === 0) {
    return (
      <Wrapper>
        <h2>لا يوجد جداول لعرضها...</h2>
      </Wrapper>
    );
  }

  const setupScheduleData = (schedule) => {
    // console.log("schedule", schedule);

    let scheduleData = {};
    const level = levels.find((lv) => lv._id === schedule.ownerId);
    const subjects = level.subjects;
    const tempSubjects = subjects.map((va) =>
      Object.values({
        name: va.name,
        teacher: va?.teacher?.name ?? "unknown",
        _id: va._id,
      }).join()
    );

    // scheduleData["level"] = level;
    const getTableCols = () => {
      let cols = [];

      for (let idx = 0; idx < level.dailyLectures; idx++) {
        cols.push({
          accessorKey: `${idx}`,
          // id:
          header: OFF_LECTURES[idx].label,
          editVariant: "select",
          mantineEditSelectProps: {
            data: tempSubjects.map((sub) => ({
              value: sub,
              label: sub.split(",")[0],
            })),
            // error: validationErrors?.state,
          },
          Cell: ({ cell }) => {
            return (
              <Box>
                <Text>{cell.getValue()?.split(",")[0] ?? ""}</Text>
                <Text>{cell.getValue()?.split(",")[1] ?? ""}</Text>
                {/* <Text>{cell.getValue()?.split(",")[2] ?? ""}</Text> */}
              </Box>
            );
          },

          //   mantineEditSelectProps: ({ row }) => ({
          //     data: backupSubjects,
          //     //store edited user in state to be saved later
          //     onChange: (value: any) =>
          //       setEditedUsers({
          //         ...editedUsers,
          //         [row.id]: { ...row.original, state: value },
          //       }),
          //   }),
        });
      }

      cols.unshift({
        accessorKey: "day",
        header: "اليوم",
        enableEditing: false,
        Cell: ({ cell }) => (
          <Box>
            <strong>{WEEK_DAYS[cell.getValue()] ?? ""}</strong>
          </Box>
        ),
      });

      scheduleData["columns"] = cols;
    };

    const getTableRows = () => {
      let rows = [];

      const getKeys = (arr) => {
        let temp = {};
        for (let key = 0; key < arr.length; key++) {
          const subject = subjects.find((sub) => sub._id === arr[key]);
          temp[`${key}`] = Object.values({
            name: subject.name,
            teacher: subject?.teacher?.name ?? "unknown",
            _id: subject._id,
          }).join();
        }

        return temp;
      };
      rows = Object.keys(schedule.schedule).map((val, idx) => {
        return {
          day: DAYS_OF_WEEK_EN[idx],
          ...getKeys(schedule.schedule[val]),
          id: idx,
        };
      });

      // scheduleData["subjects"] = tempSubjects;
      scheduleData["rows"] = rows;
      scheduleData["schedule"] = schedule;
    };

    getTableCols();
    getTableRows();
    console.log(scheduleData);
    return scheduleData;
  };

  return (
    <Wrapper>
      <h4>
        {totalSchedules} جدول {schedules.length > 1}
      </h4>
      <div className="schedules">
        {schedules.map((schedule) => (
          <div
            key={schedule.schedule._id}
            style={{ marginBottom: "50px", marginTop: "50px" }}
          >
            <h5 style={{ margin: "30px" }}>{schedule.name}</h5>
            <Schedule
              key={schedule.schedule._id}
              data={setupScheduleData(schedule)}
            />
          </div>
        ))}
      </div>
      {/* {numOfPages > 1 && <PageBtnContainer />} */}
    </Wrapper>
  );
};
export default SchedulesContainer;
