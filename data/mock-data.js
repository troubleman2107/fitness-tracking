export const sessionData = [
  {
    id: "session_001",
    date: "2024-02-15",
    name: "Upper Body Strength Training",
    exercises: [
      {
        id: "ex_001",
        name: "Bench Press",
        muscleGroup: "Chest",
        sets: [
          {
            id: "set_001",
            reps: 10,
            weight: 135,
            restTime: 60,
            active: true,
          },
          {
            id: "set_002",
            reps: 8,
            weight: 145,
            restTime: 90,
            active: false,
          },
          {
            id: "set_003",
            reps: 6,
            weight: 155,
            restTime: 120,
            active: false,
          },
        ],
      },
      {
        id: "ex_002",
        name: "Pull Ups",
        muscleGroup: "Back",
        sets: [
          {
            id: "set_004",
            reps: 8,
            weight: 0,
            restTime: 90,
            active: false,
          },
          {
            id: "set_005",
            reps: 6,
            weight: 0,
            restTime: 120,
            active: false,
          },
          {
            id: "set_006",
            reps: 4,
            weight: 0,
            restTime: 150,
            active: false,
          },
        ],
      },
      {
        id: "ex_003",
        name: "Dumbbell Shoulder Press",
        muscleGroup: "Shoulders",
        sets: [
          {
            id: "set_007",
            reps: 12,
            weight: 30,
            restTime: 60,
            active: false,
          },
          {
            id: "set_008",
            reps: 10,
            weight: 35,
            restTime: 90,
            active: false,
          },
        ],
      },
    ],
  },
  {
    id: "session_002",
    date: "2024-02-17",
    name: "Lower Body and Core",
    exercises: [
      {
        id: "ex_004",
        name: "Squats",
        muscleGroup: "Legs",
        sets: [
          {
            id: "set_009",
            reps: 12,
            weight: 185,
            restTime: 90,
            active: false,
          },
          {
            id: "set_010",
            reps: 10,
            weight: 205,
            restTime: 120,
            active: false,
          },
          {
            id: "set_011",
            reps: 8,
            weight: 225,
            restTime: 150,
            active: false,
          },
        ],
      },
      {
        id: "ex_005",
        name: "Planks",
        muscleGroup: "Core",
        sets: [
          {
            id: "set_012",
            reps: 1,
            duration: 60,
            restTime: 45,
            active: false,
          },
          {
            id: "set_013",
            reps: 1,
            duration: 75,
            restTime: 60,
            active: false,
          },
        ],
      },
    ],
  },
];
