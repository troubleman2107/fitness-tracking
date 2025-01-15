import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Template, useStore } from "@/store/useTemplateStore";
// import {
//   LineChart
// } from "react-native-chart-kit";

import { LineChart } from "react-native-gifted-charts";

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

interface DataChart2 {
  label: string;
  value: number;
  dataPointLabelComponent: React.FC;
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
  const [dataChart2, setDataChart2] = useState<DataChart2[]>([]);
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
  }, [exerciseFilter, templateFilter]);

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

    if (templateSelect) {
      const exercises: (DbExercise & {
        sets?: DbSet[];
        date: string;
        totalWeight: number;
      })[] = [];

      templateSelect.sessions?.forEach((session) => {
        const dateSession = session.date;
        const dateNow = format(new Date(), "yyyy-MM-dd");
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

      setDataChart2(
        exercises.map((item) => ({
          label:
            String(new Date(item.date).getDate()) +
            "/" +
            String(new Date(item.date).getMonth() + 1),
          value: item.totalWeight,
          // showStrip: true,
          // stripHeight: 200,
          // stripColor: "#fff",
          dataPointLabelComponent: () => {
            return (
              <View
                style={{
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: "#fafafa",
                    textAlign: "center",
                    fontSize: 12,
                  }}
                >
                  {Math.round(item.totalWeight)}
                </Text>
              </View>
            );
          },
          dataPointLabelShiftY: -15,
        }))
      );
    }
  }, [templateFilter, templates, exerciseFilter]);

  const handleDateChange = (value: string) => {};

  const handleTemplateChange = (value: string) => {
    setTemplateFilter(
      templateFilter.map((item) => ({
        ...item,
        selected: item.value === value ? true : false,
      }))
    );
  };

  const handleExerciseChange = (value: string) => {
    setExerciseFilter(
      exerciseFilter.map((item) => ({
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

            {/* <Select
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
            </Select> */}

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
                onValueChange={handleExerciseChange}
                selectedValue={exerciseSelected}
                className="mb-10"
              >
                <SelectTrigger
                  className="flex justify-between"
                  variant="outline"
                  size="md"
                >
                  <SelectInput
                    value={exerciseSelected}
                    placeholder={exerciseSelected}
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
                        key={item.value}
                        label={item.label}
                        value={item.value}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            )}

            {/* <ScrollView
              horizontal={true}
              contentOffset={{ x: 0, y: 10000 }} // i needed the scrolling to start from the end not the start
              showsHorizontalScrollIndicator={false} // to hide scroll bar
            > */}
            {dataChart2.length > 0 && (
              <LineChart
                width={Dimensions.get("window").width - 90}
                horizontalRulesStyle={{
                  color: "#e5e5e5",
                  paddingHorizional: 20,
                }}
                yAxisColor="#fafafa"
                xAxisColor="#fafafa"
                color={"#fff"}
                thickness={5}
                data={dataChart2}
                yAxisTextStyle={{ color: "#e5e5e5", fontSize: 12 }}
                xAxisLabelTextStyle={{ color: "#e5e5e5", fontSize: 12 }}
                stepHeight={30}
                startFillColor="rgb(152, 154, 156)"
                startOpacity={0.8}
                endFillColor="rgb(50, 50, 50)"
                endOpacity={0.3}
                areaChart={true}
                scrollToEnd={true}
                dataPointsColor="#fff"
                dataPointsWidth={10}
                dataPointsHeight1={10}
                curved={true}
                stepValue={10}
                maxValue={100}
              />
            )}
            {/* </ScrollView> */}
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Report;

const styles = StyleSheet.create({});
