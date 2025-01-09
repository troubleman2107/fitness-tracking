import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Template, useStore } from "@/store/useTemplateStore";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";
import { format, parseISO } from "date-fns";
import { DbExercise, DbSet } from "@/src/types/database";

const Report = () => {
  const templates = useStore((state) => state.templates);

  const exercises: (DbExercise & {
    sets?: DbSet[];
    date: string;
    totalWeight: number;
  })[] = [];
  templates[0].sessions?.forEach((session) => {
    const dateSession = session.date;
    const dateNow = format(new Date("2025-01-30"), "yyyy-MM-dd");
    if (dateSession <= dateNow) {
      session.exercises?.forEach((exercise) => {
        if (exercise.name === "Barbell Bench Press") {
          const lengthOfSets = exercise?.sets?.length
            ? exercise.sets?.length
            : 0;
          const totalWeight = exercise.sets
            ?.map((set) => set.weight)
            .reduce(
              (accumulator, currentValue) =>
                Number(accumulator) + Number(currentValue),
              0
            );
          exercises.push({
            ...exercise,
            date: dateSession,
            totalWeight: totalWeight ? totalWeight / lengthOfSets : 0,
          });
        }
      });
    }
  });

  const label = exercises
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .map(
      (item) =>
        String(new Date(item.date).getDate()) +
        "/" +
        String(new Date(item.date).getMonth() + 1)
    );
  const weight = exercises.map((item) => item.totalWeight);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-zinc-900 flex-1">
        <View className="w-full">
          <View className="p-4 bg-zinc-950 mb-[6px] rounded-[20px] h-full">
            <View className="flex flex-row justify-between items-center mb-10">
              <Text className="font-pbold text-xl text-zinc-50">Analyze</Text>
            </View>
            <LineChart
              data={{
                labels: label,
                datasets: [
                  {
                    data: weight,
                  },
                ],
              }}
              width={Dimensions.get("window").width - 30} // from react-native
              height={220}
              formatYLabel={(value) => {
                return `${value}kg`;
              }}
              // yAxisSuffix="k"
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundColor: "#09090b",
                backgroundGradientFrom: "#18181b",
                backgroundGradientTo: "#09090b",
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#fff",
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Report;

const styles = StyleSheet.create({});
