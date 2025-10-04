<script lang="ts" setup>
import type { JalaliDateTimePickerTheme } from "../types/theme.type";
import { convertToISOWithTime } from "../utils/dateUtilities";
import jalaali from "jalaali-js";
import { ref, computed, useAttrs, watch } from "vue";

defineOptions({
  name: "JalaliDateTimePicker",
  inheritAttrs: false,
});

const props = defineProps<{
  enableTime?: boolean;
  theme?: JalaliDateTimePickerTheme;
}>();

const cssVars = computed(() => {
  const t = props.theme || {};

  return {
    ...(t.primaryH ? { "--dtp-primary-h": t.primaryH } : {}),
    ...(t.primaryS ? { "--dtp-primary-s": t.primaryS } : {}),
    ...(t.primaryL ? { "--dtp-primary-l": t.primaryL } : {}),

    ...(t.primary ? { "--dtp-primary": t.primary } : {}),
    ...(t.primaryHover ? { "--dtp-primary-hover": t.primaryHover } : {}),
    ...(t.primaryActive ? { "--dtp-primary-active": t.primaryActive } : {}),
    ...(t.primaryLight ? { "--dtp-primary-light": t.primaryLight } : {}),

    ...(t.textPrimary ? { "--dtp-text-primary": t.textPrimary } : {}),
    ...(t.textSecondary ? { "--dtp-text-secondary": t.textSecondary } : {}),
    ...(t.border ? { "--dtp-border": t.border } : {}),
    ...(t.background ? { "--dtp-background": t.background } : {}),
    // ...(t.surface ? { "--dtp-surface": t.surface } : {}),

    ...(t.modalOverlay ? { "--dtp-modal-overlay": t.modalOverlay } : {}),

    ...(t.inputText ? { "--dtpi-text": t.inputText } : {}),
    ...(t.inputBackground ? { "--dtpi-background": t.inputBackground } : {}),
    ...(t.inputBorder ? { "--dtpi-border": t.inputBorder } : {}),
    ...(t.inputBorderRadius ? { "--dtpi-border-radius": t.inputBorderRadius } : {}),
    ...(t.inputFontSize ? { "--dtpi-font-size": t.inputFontSize } : {}),
    ...(t.inputPadding ? { "--dtpi-padding": t.inputPadding } : {}),
  } as Record<string, string>;
});

const { toJalaali, toGregorian, jalaaliMonthLength } = jalaali;

const label = computed(() => useAttrs().label as string | undefined);

const elementId = computed(() => {
  const attrs = useAttrs();
  const _elementIdToken = attrs.id || attrs.label;

  return _elementIdToken ? `app-text-field-${_elementIdToken}-${Math.random().toString(36).slice(2, 7)}` : undefined;
});

const showCalender = ref<boolean>(false);
const showMonthYearPicker = ref<boolean>(false);
const today = new Date();
const jToday = toJalaali(today);

const gregorianDateModel = defineModel<string | null>("date", { required: true, default: null });
const selectedJalaliDate = ref<{ year: number; month: number; day: number } | null>(null);
const currentMonthAndYear = ref({ year: jToday.jy, month: jToday.jm });
const transitionDirection = ref<"left" | "right" | "up">("left");
const selectedTime = ref<{ hour: number; minute: number }>({ hour: 0, minute: 0 });
const currentStep = ref<"date" | "time">("date");

const persianMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];
const persianWeekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const weekDaysFull = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

// Time Picker
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const formattedTime = computed(() => {
  const h = selectedTime.value.hour.toString().padStart(2, "0");
  const m = selectedTime.value.minute.toString().padStart(2, "0");

  return `${h}:${m}`;
});

// Date Picker
const formattedDate = computed(() => {
  if (!gregorianDateModel.value) return "";

  const gDate = new Date(gregorianDateModel.value);
  const jDate = toJalaali(gDate);

  if (props.enableTime) {
    const h = gDate.getHours().toString().padStart(2, "0");
    const m = gDate.getMinutes().toString().padStart(2, "0");

    return `${h}:${m} - ${jDate.jy}/${jDate.jm.toString().padStart(2, "0")}/${jDate.jd.toString().padStart(2, "0")}`;
  } else {
    return `${jDate.jy}/${jDate.jm.toString().padStart(2, "0")}/${jDate.jd.toString().padStart(2, "0")}`;
  }
}); // For Show Jalali Date In Input

const formattedHeaderDate = computed(() => {
  if (!selectedJalaliDate.value) return "";

  const { year, month, day } = selectedJalaliDate.value;
  const gDate = toGregorian(year, month, day);
  const weekday = weekDaysFull[new Date(gDate.gy, gDate.gm - 1, gDate.gd).getDay()];

  // if (props.enableTime)
  //   return `${weekday} ${day} ${persianMonths[month - 1]} ${formattedTime.value || '00:00'}`
  // else
  return `${weekday} ${day} ${persianMonths[month - 1]}`;
}); // For Show Selected Date In Header

const calenderData = computed(() => {
  const { year, month } = currentMonthAndYear.value;
  const numDays = jalaaliMonthLength(year, month);

  const dayInfo = Array.from({ length: numDays }, (_, i) => {
    const day = i + 1;
    const gDate = toGregorian(year, month, day);

    return { day, weekday: new Date(gDate.gy, gDate.gm - 1, gDate.gd).getDay() };
  });

  return { year, month, dayInfo };
}); // For Show Days of month in calender

const getPersianWeekdayIndex = (jsWeekday: number) => (jsWeekday + 1) % 7;

const goToPreviousMonth = () => {
  transitionDirection.value = "left";
  let { year, month } = currentMonthAndYear.value;

  if (month === 1) {
    year--;
    month = 12;
  } else {
    month--;
  }

  currentMonthAndYear.value = { year, month };
};

const goToNextMonth = () => {
  transitionDirection.value = "right";
  let { year, month } = currentMonthAndYear.value;

  if (month === 12) {
    year++;
    month = 1;
  } else {
    month++;
  }

  currentMonthAndYear.value = { year, month };
};

const clearDate = () => {
  gregorianDateModel.value = null;
  selectedJalaliDate.value = null;
  selectedTime.value = { hour: 0, minute: 0 };
};

const selectDateOfToday = () => {
  const j = toJalaali(new Date());

  const isDifferentMonth = currentMonthAndYear.value.year !== j.jy || currentMonthAndYear.value.month !== j.jm;

  if (isDifferentMonth) {
    transitionDirection.value = "up";
    currentMonthAndYear.value = { year: j.jy, month: j.jm };
  }

  selectedJalaliDate.value = { year: j.jy, month: j.jm, day: j.jd };
};

const selectTimeOfToday = () => {
  const gDate = new Date();

  selectedTime.value = { hour: gDate.getHours(), minute: gDate.getMinutes() };
};

const selectMonth = (month: number) => {
  transitionDirection.value = "up";
  currentMonthAndYear.value.month = month;
  showMonthYearPicker.value = false;
};

const handleDateSelect = (day: number, month: number, year: number) => {
  selectedJalaliDate.value = { year, month, day };
}; // Fill selectedDate variable

const handleSubmit = () => {
  if (!selectedJalaliDate.value) return;

  const { year, month, day } = selectedJalaliDate.value;
  const gDate = toGregorian(year, month, day);

  const dateObj = new Date(gDate.gy, gDate.gm - 1, gDate.gd);

  gregorianDateModel.value = props.enableTime
    ? convertToISOWithTime(dateObj.toString(), selectedTime.value.hour, selectedTime.value.minute)
    : convertToISOWithTime(dateObj.toString());

  currentStep.value = "date";
  showCalender.value = false;
};

watch(showCalender, () => {
  if (showCalender.value) {
    if (!gregorianDateModel.value) {
      selectDateOfToday();
    } else {
      const gDate = new Date(gregorianDateModel.value || "");
      const jDate = toJalaali(gDate);

      selectedJalaliDate.value = { year: jDate.jy, month: jDate.jm, day: jDate.jd };

      currentMonthAndYear.value = { year: jDate.jy, month: jDate.jm };

      if (props.enableTime) selectedTime.value = { hour: gDate.getHours(), minute: gDate.getMinutes() };
    }
  } else {
    selectedJalaliDate.value = null;
    currentStep.value = "date";
  }
});

// Dropdown
const openDropdown = ref<"hour" | "minute" | null>(null);

function toggleDropdown(type: "hour" | "minute" | null) {
  openDropdown.value = openDropdown.value === type ? null : type;
}

function selectOption(type: "hour" | "minute", value: number) {
  selectedTime.value[type] = value;
  openDropdown.value = null;
}
</script>

<template>
  <div class="date-time-picker" dir="rtl" :class="$attrs.class" :style="cssVars">
    <!-- Input Field & Label -->
    <div class="picker-field">
      <slot
        name="input"
        :label="label"
        :element-id="elementId"
        :formatted-date="formattedDate"
        :show-calender="showCalender"
        :set-show-calender="(val: boolean) => showCalender = val"
        :clear-date="clearDate"
      >
        <label v-if="label" :for="elementId" class="picker-label">
          {{ label }}
        </label>

        <div class="picker-input-wrapper">
          <input
            :id="elementId"
            class="picker-input"
            v-bind="$attrs"
            :value="formattedDate"
            readonly
            @click="showCalender = true"
          />

          <button v-if="formattedDate" class="clear-btn" @click="clearDate">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <button class="calendar-btn" @click="showCalender = true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        </div>
      </slot>
    </div>

    <!-- Main Calendar Dialog -->
    <transition name="fade">
      <div v-if="showCalender" class="modal-overlay">
        <div class="modal-container" @click.self="showCalender = false">
          <transition name="fade-scale" mode="out-in">
            <div class="modal-content" :key="currentStep">
              <div>
                <!-- Date Picker -->
                <div v-if="currentStep === 'date'" class="calendar-container">
                  <!-- header -->
                  <div class="calendar-header">
                    <div class="header-date-display">
                      {{ formattedHeaderDate || "-" }}
                    </div>
                    <div class="header-month-year">
                      <button class="nav-btn" @click="goToPreviousMonth">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                      <button class="month-year-btn" @click="showMonthYearPicker = true">
                        {{ persianMonths[currentMonthAndYear.month - 1] }} {{ currentMonthAndYear.year }}
                      </button>
                      <button class="nav-btn" @click="goToNextMonth">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- body -->
                  <div class="calendar-body" style="padding-bottom: 6px !important">
                    <div class="calendar-weekdays">
                      <span v-for="day in persianWeekDays" :key="day">{{ day }}</span>
                    </div>

                    <div class="calendar-days-container">
                      <transition :name="`slide-${transitionDirection}`" mode="out-in">
                        <div :key="`${currentMonthAndYear.year}-${currentMonthAndYear.month}`" class="calendar-days">
                          <span
                            v-for="n in getPersianWeekdayIndex(calenderData.dayInfo[0].weekday)"
                            :key="`empty-${n}`"
                            class="empty-day"
                          ></span>

                          <button
                            v-for="dayInfo in calenderData.dayInfo"
                            :key="dayInfo.day"
                            class="day-btn"
                            :class="{
                              selected:
                                selectedJalaliDate?.day === dayInfo.day &&
                                selectedJalaliDate?.month === calenderData.month &&
                                selectedJalaliDate.year === calenderData.year,
                            }"
                            @click="handleDateSelect(dayInfo.day, calenderData.month, calenderData.year)"
                          >
                            {{ dayInfo.day }}
                          </button>
                        </div>
                      </transition>
                    </div>
                  </div>

                  <!-- footer (actions) -->
                  <div class="calendar-footer">
                    <div>
                      <button class="footer-btn now-btn" @click="selectDateOfToday">اکنون</button>
                    </div>

                    <div>
                      <button
                        v-if="enableTime"
                        class="footer-btn time-btn"
                        :disabled="!selectedJalaliDate"
                        @click="currentStep = 'time'"
                      >
                        انتخاب زمان
                      </button>

                      <button v-else class="footer-btn confirm-btn" @click="handleSubmit">تایید</button>
                    </div>
                  </div>
                </div>

                <!-- Time Picker -->
                <div v-else-if="enableTime && currentStep === 'time'" class="time-picker-container">
                  <div class="time-picker-header">
                    <div class="header-date-display">
                      {{ formattedHeaderDate || "----" }}
                    </div>
                  </div>

                  <div class="time-picker-body">
                    <div class="digital-clock">
                      {{ formattedTime }}
                    </div>

                    <div class="time-selectors">
                      <!-- Hours -->
                      <div class="time-selector">
                        <label>ساعت</label>
                        <div class="custom-select" @click="toggleDropdown('hour')">
                          <div class="selected">{{ selectedTime.hour }}</div>
                          <div class="select-arrow">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              :class="{ open: openDropdown === 'hour' }"
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </div>

                          <ul v-if="openDropdown === 'hour'" class="options">
                            <li v-for="hour in hours" :key="hour" @click.stop="selectOption('hour', +hour)">
                              {{ hour }}
                            </li>
                          </ul>
                        </div>
                      </div>

                      <!-- Minutes -->
                      <div class="time-selector">
                        <label>دقیقه</label>
                        <div class="custom-select" @click="toggleDropdown('minute')">
                          <div class="selected">{{ selectedTime.minute }}</div>
                          <div class="select-arrow">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              :class="{ open: openDropdown === 'minute' }"
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </div>

                          <ul v-if="openDropdown === 'minute'" class="options">
                            <li v-for="minute in minutes" :key="minute" @click.stop="selectOption('minute', +minute)">
                              {{ minute }}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="time-picker-footer">
                    <div>
                      <button class="footer-btn now-btn" @click="selectTimeOfToday">اکنون</button>
                    </div>

                    <div style="display: flex; gap: 8px">
                      <button class="footer-btn back-btn" @click="currentStep = 'date'">انتخاب تاریخ</button>
                      <button class="footer-btn confirm-btn" @click="handleSubmit">تایید</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </transition>

    <!-- Month & Year Picker Dialog -->
    <transition name="fade">
      <div
        v-if="showMonthYearPicker"
        class="modal-overlay"
        style="background-color: transparent !important"
        @click.self="showMonthYearPicker = false"
      >
        <div class="month-year-picker">
          <div class="month-year-picker-body">
            <div class="year-selector">
              <button class="year-nav-btn" @click="currentMonthAndYear.year--">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              <span class="year-display">{{ currentMonthAndYear.year }}</span>

              <button class="year-nav-btn" @click="currentMonthAndYear.year++">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            </div>

            <div class="month-grid">
              <button
                v-for="(month, index) in persianMonths"
                :key="index"
                class="month-btn"
                :class="{ selected: currentMonthAndYear.month === index + 1 }"
                @click="selectMonth(index + 1)"
              >
                {{ month }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped src="../styles/date-time-picker.scss" />

<style scoped src="../styles/data-time-picker-layout.scss" />
