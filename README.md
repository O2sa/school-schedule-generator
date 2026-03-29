
# 🏫 School Schedule Generator

<p align="center">
  <img src="./school-schedule.png" alt="School Schedule Generator Interface Screenshot" width="700"/>
</p>

<p align="center">
  <strong>📅 A powerful web application to automatically generate conflict-free school timetables for multiple classes.</strong>
</p>

<p align="center">
  Streamline the complex task of academic scheduling with this full-stack JavaScript application.
</p>

## ✨ About The Project

Manually creating school schedules that satisfy all constraints—teacher availability, class subjects, room capacity, and time slots—is a complex and time-consuming puzzle. This project aims to solve that by providing a platform that automates the generation of optimal school timetables.

### 🛠️ Built With

This is a full-stack JavaScript application:

*   **Backend:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
*   **Frontend:** React, Mantine Ui.
*   **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM

## 🚀 Key Features

*   **Automated Scheduling:** Generates schedules for different classes based on predefined constraints.
*   **Constraint Management:** Handles core rules like teacher unavailability, subject allocation, and classroom conflicts.
*   **Data Persistence:** Uses MongoDB to store teachers, classes, subjects, and generated schedules.
*   **Simple Web Interface:** Easy-to-use frontend for interacting with the generator and viewing results.
*   **Modular Codebase:** Organized structure with separate concerns (controllers, models, routes, utilities).

## 🏁 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

*   **Node.js** (version 18 or later)
*   **npm** (usually comes with Node.js)
*   **MongoDB** (installed and running locally, or a cloud instance like MongoDB Atlas)

### Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/O2sa/school-schedule-generator.git
    cd school-schedule-generator
    ```

2.  **Install backend dependencies**
    ```bash
    npm install
    ```

3.  **Configure the database**
    *   Ensure your MongoDB server is running.
    *   You may need to configure the database connection string. Check the codebase (likely in a `.env` file or directly in `server.js`) for where the MongoDB URI is set. The default might be `mongodb://localhost:27017/school-scheduler`.

4.  **(Optional) Populate the database with sample data**
    *   The project includes a `populate.js` script to seed the database with initial demo data.
    *   Run it using:
        ```bash
        node populate.js
        ```

5.  **Run the application**
    ```bash
    npm run dev
    ```
    This command likely starts the backend server (using something like `nodemon`) and makes the frontend accessible.

6.  **Access the app**
    Open your browser and navigate to `http://localhost:3000` (or the port specified in your console).


## 🤝 Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion to improve the scheduling algorithm, add new features, or fix a bug:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request



## 🙏 Acknowledgments

*   Hat tip to anyone whose code or algorithm was used as inspiration.
