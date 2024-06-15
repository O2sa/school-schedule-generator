import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Table,
  useMantineTheme,
  ColorSchemeProvider,
  createEmotionCache,
} from "@mantine/core";
import rtlPlugin from "stylis-plugin-rtl";

import {
  HomeLayout,
  Landing,
  Register,
  Login,
  DashboardLayout,
  Error,
  AddJob,
  Stats,
  AllJobs,
  Profile,
  Admin,
  EditJob,
  Schedules,
  Levels,
  AddLevel,
  LevelInfo,
  Teachers,
  SubjectsContainer,
  School,
  AdminsManagement,
  NewAdmin,
  AddTeacher,
  TeacherDetail,
  AddSubject,
} from "./pages";

import { action as registerAction } from "./pages/Register";
import { action as loginAction } from "./pages/Login";
import { loader as dashboardLoader } from "./pages/DashboardLayout";
import { action as addJobAction } from "./pages/AddJob";
import { loader as allJobsLoader } from "./pages/AllJobs";
import { loader as editJobLoader } from "./pages/EditJob";
import { action as editJobAction } from "./pages/EditJob";
import { action as deleteJobAction } from "./pages/DeleteJob";
import { loader as adminLoader } from "./pages/Admin";
import { action as profileAction } from "./pages/Profile";
import { loader as statsLoader } from "./pages/Stats";
import ErrorElement from "./components/ErrorElement";

import { loader as schedulesLoader } from "./pages/Schedules";
import { loader as levelsLoader } from "./pages/Levels";
import { action as addLevelAction } from "./pages/AddLevel";
import { action as deleteLevelAction } from "./pages/DeleteLevel";
import { loader as levelInfoLoader } from "./pages/LevelInfo";
import { action as levelInfoAction } from "./pages/LevelInfo";
import { loader as SubjectsContainerLoader } from "./pages/SubjectsContainer";
import { loader as SchoolLoader } from "./pages/SchoolDetail";
import { action as SchoolAction } from "./pages/SchoolDetail";
import { action as NewAdminAction } from "./pages/NewAdmin";
import { action as AddTeacherAction } from "./pages/ِAddTeacher";
import { loader as TeacherDetailsLoader } from "./pages/TeacherDetail";
import { loader as AddSubjectLoader } from "./pages/AddSubject";
import { action as AddSubjectAction } from "./pages/AddSubject";

import { MantineProvider } from "@mantine/core";
// import { action as subjectsAction } from "./pages/SubjectsContainer";
// import { loader as teachersLoader } from "./pages/Teachers";

export const checkDefaultTheme = () => {
  const isDarkTheme = localStorage.getItem("darkTheme") === "true";
  document.body.classList.toggle("dark-theme", isDarkTheme);
  return isDarkTheme;
};

checkDefaultTheme();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "register",
        element: <Register />,
        action: registerAction,
      },
      {
        path: "login",
        element: <Login />,
        action: loginAction(queryClient),
      },
      {
        path: "dashboard",
        element: <DashboardLayout queryClient={queryClient} />,
        loader: dashboardLoader(queryClient),
        children: [
          {
            index: true,
            element: <Schedules />,
            loader: schedulesLoader,
          },
          {
            path: "levels",
            children: [
              {
                index: true,
                element: <Levels />,
                loader: levelsLoader(queryClient),
              },
              {
                path: "add-level",
                element: <AddLevel />,
                action: addLevelAction(queryClient),
              },
              {
                path: "delete-level/:id",
                action: deleteLevelAction(queryClient),
              },
              {
                path: "level-info/:id",
                children: [
                  {
                    index: true,
                    element: <LevelInfo />,
                    loader: levelInfoLoader(queryClient),
                    action: levelInfoAction(queryClient),
                  },
                  {
                    path: "subjects",
                    element: <SubjectsContainer />,
                    loader: SubjectsContainerLoader(queryClient),
                    // action: subjectsAction,
                  },
                  {
                    path: "add-subject",
                    element: <AddSubject />,
                    loader: AddSubjectLoader(queryClient),
                    action: AddSubjectAction(queryClient),
                  },
                ],
              },
            ],
          },
          {
            path: "teachers",
            // loader: teachersLoader(queryClient),
            children: [
              {
                index: true,
                element: <Teachers queryClient={queryClient}/>,
                // loader: levelsLoader(queryClient),
              },
              {
                path: "add-teacher",
                element: <AddTeacher />,
                action: AddTeacherAction(queryClient),
              },
              {
                path: "teacher-details/:id",
                element: <TeacherDetail />,
                // action: TeacherDetailsAction(queryClient),
                loader: TeacherDetailsLoader(queryClient),
              },
            ],
          },
          {
            path: "school",
            element: <School queryClient={queryClient}/>,
            loader: SchoolLoader(queryClient),
            action: SchoolAction(queryClient),
          },
          {
            path: "admins",
            children: [
              {
                index: true,
                element: <AdminsManagement />,
              },
              {
                path: "new-admin",
                element: <NewAdmin />,
                action: NewAdminAction,
              },
            ],
          },
    
          {
            path: "profile",
            element: <Profile />,
            action: profileAction(queryClient),
          },
      
        ],
      },
    ],
  },
]);

const rtlCache = createEmotionCache({
  key: "mantine-rtl",
  stylisPlugins: [rtlPlugin],
});

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = useMantineTheme({ colorScheme: isDarkMode ? "dark" : "light" });

  return (
    <QueryClientProvider client={queryClient}>
      <ColorSchemeProvider
        value={isDarkMode ? "dark" : "light"}
        onChange={() => setIsDarkMode((prevMode) => !prevMode)}
      >
        <MantineProvider
          // withGlobalStyles
          // withNormalizeCSS
          emotionCache={rtlCache}
          theme={{
            dir: "rtl",
            fontFamily: "Cairo, sans-serif;",
            colors: {
              brand: [
                "#f2eaff",
                "#d4c4f0",
                "#b69fe2",
                "#9979d4",
                "#7b52c6",
                "#6239ad",
                "#4c2c87",
                "#361e62",
                "#21123d",
                "#0d041a",
              ],
            },
            primaryColor: "brand",
            primaryShade: 4,
          }}
        >
          {" "}
          <RouterProvider router={router} />
        </MantineProvider>
      </ColorSchemeProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
