import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Table, useMantineTheme, ColorSchemeProvider } from "@mantine/core";
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
                    element: <SubjectsContainer queryClient={queryClient} />,
                    loader: SubjectsContainerLoader(queryClient),
                    // action: subjectsAction,
                  },
                ],
              },
            ],
          },
          {
            path: "teachers",
            element: <Teachers />,
            // loader: teachersLoader(queryClient),
          },

          // {
          //   index: "add-job",
          //   element: <AddJob />,
          //   action: addJobAction(queryClient),
          // },
          // {
          //   path: "stats",
          //   element: <Stats />,
          //   loader: statsLoader(queryClient),
          //   errorElement: <ErrorElement />,
          // },
          // {
          //   path: "all-jobs",
          //   element: <AllJobs />,
          //   loader: allJobsLoader(queryClient),
          //   errorElement: <ErrorElement />,
          // },
          // {
          //   path: "profile",
          //   element: <Profile />,
          //   action: profileAction(queryClient),
          // },
          // {
          //   path: "admin",
          //   element: <Admin />,
          //   loader: adminLoader,
          // },
          // {
          //   path: "edit-job/:id",
          //   element: <EditJob />,
          //   loader: editJobLoader(queryClient),
          //   action: editJobAction(queryClient),
          // },
          // { path: "delete-job/:id", action: deleteJobAction(queryClient) },
        ],
      },
    ],
  },
]);

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = useMantineTheme({ colorScheme: isDarkMode ? "dark" : "light" });

  return (
    <QueryClientProvider client={queryClient}>
      <ColorSchemeProvider
        value={isDarkMode ? "dark" : "light"}
        onChange={() => setIsDarkMode((prevMode) => !prevMode)}
      >
        <MantineProvider theme={{ fontFamily: "Cairo, sans-serif;" }} dir="rtl">
          <RouterProvider router={router} />
        </MantineProvider>
      </ColorSchemeProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
export default App;
