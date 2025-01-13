import { Dimensions, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
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
import { format, parseISO, set } from "date-fns";
import { DbExercise, DbSet } from "@/src/types/database";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { ChevronDownIcon } from "@/components/ui/icon";

interface SelectLabel {
  label: string;
  value: string;
  selected: boolean;
}

interface DataChart {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

const Report = () => {
  const templates = useStore((state) => state.templates);

  const [dateFilter, setDayFilter] = useState<SelectLabel[]>([
    {
      label: "This Month",
      value: "month",
      selected: true,
    },
    {
      label: "This Day",
      value: "day",
      selected: false,
    },
    {
      label: "This Year",
      value: "year",
      selected: false,
    },
  ]);

  const [templateFilter, setTemplateFilter] = useState<SelectLabel[]>([]);
  const [exerciseFilter, setExerciseFilter] = useState<SelectLabel[]>([]);
  const [exerciseSelected, setExerciseSelected] = useState<string | undefined>(
    ""
  );
  console.log("🚀 ~ Report ~ exerciseSelected:", exerciseSelected);

  const [dataChart, setDataChart] = useState<DataChart>({
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  });

  useEffect(() => {
    if (exerciseFilter && exerciseFilter.length > 0) {
      setExerciseSelected(
        exerciseFilter?.find((item) => item?.selected)?.value
      );
    }
  }, [exerciseFilter]);

  // useEffect(() => {
  //   if(exerciseFilter) {
  //     setExerciseSelected(exerciseFilter.find((item) => item.selected)?.value);
  //   }
  // }, [exerciseFilter])

  useEffect(() => {
    setTemplateFilter(
      templates.map((template, idx) => ({
        label: template.name,
        value: template.id,
        selected: idx === 0 ? true : false,
      }))
    );
  }, [templates]);

  useEffect(() => {
    console.log("re run");

    const findTemplate = templates.find(
      (template) =>
        template.id === templateFilter.find((item) => item.selected)?.value
    );

    const uniqueExercises = new Set<string>();
    findTemplate?.sessions?.forEach((session) => {
      session?.exercises?.forEach((exercise) => {
        uniqueExercises.add(exercise.name);
      });
    });

    setExerciseFilter(
      Array.from(uniqueExercises).map((exerciseName, idx) => ({
        label: exerciseName,
        value: exerciseName,
        selected: idx === 0 ? true : false,
      }))
    );
  }, [templateFilter]);

  useEffect(() => {
    const templateId = templateFilter.find((item) => item.selected)?.value;
    const templateSelect = templates.find((item) => item.id === templateId);
    console.log("🚀 ~ handleDataChart ~ templateSelect:", templateSelect);

    if (templateSelect) {
      const exercises: (DbExercise & {
        sets?: DbSet[];
        date: string;
        totalWeight: number;
      })[] = [];

      templateSelect.sessions?.forEach((session) => {
        const dateSession = session.date;
        const dateNow = format(new Date("2025-01-30"), "yyyy-MM-dd");
        if (dateSession <= dateNow) {
          session.exercises?.forEach((exercise) => {
            if (
              exercise.name ===
              exerciseFilter.find((item) => item.selected)?.value
            ) {
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

      setDataChart({
        labels: label,
        datasets: [
          {
            data: weight,
          },
        ],
      });
    }
  }, [templateFilter, templates, exerciseFilter]);

  const handleDataChart = () => {
    const templateId = templateFilter.find((item) => item.selected)?.value;
    const templateSelect = templates.find((item) => item.id === templateId);
    console.log("🚀 ~ handleDataChart ~ templateSelect:", templateSelect);

    if (templateSelect === undefined) return;

    const exercises: (DbExercise & {
      sets?: DbSet[];
      date: string;
      totalWeight: number;
    })[] = [];

    templateSelect.sessions?.forEach((session) => {
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

    setDataChart({
      labels: label,
      datasets: [
        {
          data: weight,
        },
      ],
    });
  };

  const handleDateChange = (value: string) => {};

  const handleTemplateChange = (value: string) => {
    setTemplateFilter(
      templateFilter.map((item) => ({
        ...item,
        selected: item.value === value ? true : false,
      }))
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="bg-zinc-900 flex-1">
        <View className="w-full">
          <View className="p-4 bg-zinc-950 mb-[6px] rounded-[20px] h-full">
            <View className="flex flex-row justify-between items-center mb-10">
              <Text className="font-pbold text-xl text-zinc-50">Analyze</Text>
            </View>

            <Select
              className="mb-3"
              onValueChange={handleDateChange}
              defaultValue={dateFilter.find((item) => item.selected)?.value}
              initialLabel={dateFilter.find((item) => item.selected)?.label}
            >
              <SelectTrigger
                className="flex justify-between"
                variant="outline"
                size="md"
              >
                <SelectInput placeholder="Select option" />
                <SelectIcon className="mr-3" as={ChevronDownIcon} />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>

                  {dateFilter.map((item, idx) => (
                    <SelectItem
                      key={idx}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>

            {templateFilter.length > 0 && (
              <Select
                onValueChange={handleTemplateChange}
                defaultValue={
                  templateFilter.find((item) => item.selected)?.value
                }
                initialLabel={
                  templateFilter.find((item) => item.selected)?.label
                }
                selectedValue={
                  templateFilter.find((item) => item.selected)?.value
                }
                className="mb-3"
              >
                <SelectTrigger
                  className="flex justify-between"
                  variant="outline"
                  size="md"
                >
                  <SelectInput placeholder="Select option" />
                  <SelectIcon className="mr-3" as={ChevronDownIcon} />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {templateFilter.map((item, idx) => (
                      <SelectItem
                        key={idx}
                        label={item.label}
                        value={item.value}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            )}

            {exerciseFilter.length > 0 && (
              <Select
                // onValueChange={handleTemplateChange}
                initialLabel={exerciseSelected}
                selectedValue={exerciseSelected}
                className="mb-3"
              >
                <SelectTrigger
                  className="flex justify-between"
                  variant="outline"
                  size="md"
                >
                  <SelectInput
                    placeholder={
                      exerciseFilter.find((item) => item.selected)?.label
                    }
                  />
                  <SelectIcon className="mr-3" as={ChevronDownIcon} />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {exerciseFilter.map((item, idx) => (
                      <SelectItem
                        key={idx}
                        label={item.label}
                        value={item.value}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            )}

            {dataChart.labels.length > 0 && (
              <LineChart
                data={dataChart}
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
                  labelColor: (opacity = 1) =>
                    `rgba(255, 255, 255, ${opacity})`,
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
            )}
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Report;

const styles = StyleSheet.create({});
