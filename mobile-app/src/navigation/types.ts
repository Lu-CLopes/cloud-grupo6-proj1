export type RootStackParamList = {
    Login: undefined;
    MainTabs: undefined;
    WodDetail: { wodId: number };
    NewWod: undefined;
    ExerciseDetail: { exerciseName: string };
    Settings: undefined;
};

export type MainTabParamList = {
    Dashboard: undefined;
    History: undefined;
    Calculator: undefined;
    Exercises: undefined;
};