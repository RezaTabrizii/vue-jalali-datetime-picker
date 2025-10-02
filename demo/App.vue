<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { JalaliDateTimePicker, JalaliMultipleDatePicker } from "@/index";

const selectedDate = ref<string | null>(null);
const selectedDateAndTime = ref<string | null>(null);
const selectedManyDates = ref<string[] | null>([]);
const selectedPeriodOfDates = ref<string[] | null>([]);
const selectedDate2 = ref<string | null>(null);
const selectedDate3 = ref<string | null>(null);

watchEffect(() => {
  console.clear();

  console.log(selectedDate.value);
  console.log(selectedDateAndTime.value);
  console.log(selectedManyDates.value);
  console.log(selectedPeriodOfDates.value);
  console.log(selectedDate2.value);
  console.log(selectedDate3.value);
});
</script>

<template>
  <main>
    <div style="display: flex; flex-direction: column; gap: 24px">
      <JalaliDateTimePicker v-model:date="selectedDate" label="انتخاب تاریخ" />

      <JalaliDateTimePicker v-model:date="selectedDateAndTime" label="انتخاب تاریخ و زمان" enable-time />

      <JalaliMultipleDatePicker
        v-model:dates="selectedManyDates"
        label="انتخاب چندین تاریخ"
        type="multiple"
      ></JalaliMultipleDatePicker>

      <JalaliMultipleDatePicker
        v-model:dates="selectedPeriodOfDates"
        label="انتخاب بازه ای از تاریخ ها"
        type="range"
      ></JalaliMultipleDatePicker>

      <JalaliDateTimePicker
        v-model:date="selectedDate2"
        label="تقویم با تم کاستوم"
        :theme="{ primaryH: '300', primaryS: '70%', primaryL: '45%', textSecondary: 'white' }"
      />

      <JalaliDateTimePicker v-model:date="selectedDate3" label="انتخاب تاریخ با فیلد کاستوم">
        <template #input="{ label, elementId, formattedDate, setShowCalender, clearDate }">
          <div>
            <label
              v-if="label"
              :for="elementId"
              style="display: block; margin-bottom: 6px; font-size: 14px; color: #333; font-weight: 500"
            >
              {{ label }}
            </label>

            <div
              @click="setShowCalender(true)"
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                border: 1px solid #ccc;
                border-radius: 6px;
                padding: 8px 10px;
                font-size: 14px;
                color: #333;
                background: #fff;
                cursor: pointer;
                min-height: 36px;
              "
            >
              <span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ formattedDate || "—" }}
              </span>

              <button
                v-if="formattedDate"
                @click.stop="clearDate"
                style="background: none; border: none; color: #888; cursor: pointer; padding: 2px 4px; font-size: 14px"
              >
                ❌
              </button>
            </div>
          </div>
        </template>
      </JalaliDateTimePicker>
    </div>
  </main>
</template>
