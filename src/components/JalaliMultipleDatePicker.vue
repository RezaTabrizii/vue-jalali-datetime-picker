<script lang="ts" setup>
import type { JalaliDateTimePickerTheme } from "../types/theme.type";
import { convertToISOWithTime } from "../utils/dateUtilities";
import { truncateSplit } from "../utils/stringUtilities";
import jalaali from "jalaali-js";
import { ref, computed, useAttrs, watch } from "vue";

defineOptions({
  name: "JalaliMultipleDatePicker",
  inheritAttrs: false,
});

const props = defineProps<{
  type: "multiple" | "range";
  format?: "date" | "datetime";
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
const selectionType = computed(() => props.type ?? "multiple");
const transitionDirection = ref<"left" | "right" | "up">("left");

const gregorianDateModel = defineModel<string[] | null>("dates", { required: true, default: () => [] });
const selectedJalaliDates = ref<{ year: number; month: number; day: number }[]>([]);
const currentMonthAndYear = ref({ year: jToday.jy, month: jToday.jm });

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

const formattedDate = computed(() => {
  if (!gregorianDateModel.value?.length) return "";

  return gregorianDateModel.value
    .map((d) => {
      const gDate = new Date(d);
      const jDate = toJalaali(gDate);

      return `${jDate.jy}/${jDate.jm.toString().padStart(2, "0")}/${jDate.jd.toString().padStart(2, "0")}`;
    })
    .join(", ");
});

const formattedHeaderDate = computed(() => {
  if (!selectedJalaliDates.value.length) return "";

  if (props.type === "range" && selectedJalaliDates.value.length === 2) {
    const [start, end] = selectedJalaliDates.value;
    const startG = toGregorian(start.year, start.month, start.day);
    const endG = toGregorian(end.year, end.month, end.day);
    const startW = weekDaysFull[new Date(startG.gy, startG.gm - 1, startG.gd).getDay()];
    const endW = weekDaysFull[new Date(endG.gy, endG.gm - 1, endG.gd).getDay()];

    const startLabel = `${startW} ${start.day} ${persianMonths[start.month - 1]}`;
    const endLabel = `${endW} ${end.day} ${persianMonths[end.month - 1]}`;

    return `از ${startLabel} تا ${endLabel}`;
  }

  // Default: multiple selection format
  return selectedJalaliDates.value
    .map(({ year, month, day }) => {
      const g = toGregorian(year, month, day);
      const weekday = weekDaysFull[new Date(g.gy, g.gm - 1, g.gd).getDay()];

      return `${weekday} ${day} ${persianMonths[month - 1]}`;
    })
    .join("، ");
});

const calenderData = computed(() => {
  const { year, month } = currentMonthAndYear.value;
  const numDays = jalaaliMonthLength(year, month);

  const dayInfo = Array.from({ length: numDays }, (_, i) => {
    const day = i + 1;
    const gDate = toGregorian(year, month, day);

    return { day, weekday: new Date(gDate.gy, gDate.gm - 1, gDate.gd).getDay() };
  });

  return { year, month, dayInfo };
});

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
  gregorianDateModel.value = [];
  selectedJalaliDates.value = [];
};

const selectDateOfToday = () => {
  const j = toJalaali(new Date());

  const isDifferentMonth = currentMonthAndYear.value.year !== j.jy || currentMonthAndYear.value.month !== j.jm;

  if (isDifferentMonth) {
    transitionDirection.value = "up";
    currentMonthAndYear.value = { year: j.jy, month: j.jm };
  }

  selectedJalaliDates.value = [{ year: j.jy, month: j.jm, day: j.jd }];
};

const selectMonth = (month: number) => {
  transitionDirection.value = "up";
  currentMonthAndYear.value.month = month;
  showMonthYearPicker.value = false;
};

const handleDateSelect = (day: number, month: number, year: number) => {
  const newDate = { year, month, day };

  if (selectionType.value === "multiple") {
    const index = selectedJalaliDates.value.findIndex((d) => d.year === year && d.month === month && d.day === day);

    if (index !== -1) selectedJalaliDates.value.splice(index, 1);
    else selectedJalaliDates.value.push(newDate);
  } else if (selectionType.value === "range") {
    if (selectedJalaliDates.value.length === 0) {
      selectedJalaliDates.value = [newDate];
    } else if (selectedJalaliDates.value.length === 1) {
      selectedJalaliDates.value.push(newDate);
      selectedJalaliDates.value.sort((a, b) => {
        const { gy: agy, gm: agm, gd: agd } = toGregorian(a.year, a.month, a.day);
        const { gy: bgy, gm: bgm, gd: bgd } = toGregorian(b.year, b.month, b.day);

        const da = new Date(agy, agm - 1, agd);
        const db = new Date(bgy, bgm - 1, bgd);

        return da.getTime() - db.getTime();
      });
    } else {
      selectedJalaliDates.value = [newDate];
    }
  }
};

const handleSubmit = () => {
  if (!selectedJalaliDates.value.length) return;

  let gregorianDates: string[];
  if (selectionType.value === "range" && selectedJalaliDates.value.length === 2) {
    const [start, end] = selectedJalaliDates.value;

    const startG = toGregorian(start.year, start.month, start.day);
    const endG = toGregorian(end.year, end.month, end.day);

    const startDate = new Date(startG.gy, startG.gm - 1, startG.gd);
    const endDate = new Date(endG.gy, endG.gm - 1, endG.gd);

    // Collect all dates in the range
    gregorianDates = [];

    let current = new Date(startDate);

    while (current <= endDate) {
      gregorianDates.push(convertToISOWithTime(current.toString(), props.format === "datetime"));
      current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
    }
  } else {
    gregorianDates = selectedJalaliDates.value.map(({ year, month, day }) => {
      const g = toGregorian(year, month, day);

      return convertToISOWithTime(new Date(g.gy, g.gm - 1, g.gd).toString(), props.format === "datetime");
    });
  }

  gregorianDateModel.value = gregorianDates;
  showCalender.value = false;
};

const isDateInRange = (date: { day: number; month: number; year: number }) => {
  if (selectionType.value !== "range" || selectedJalaliDates.value.length !== 2) return false;

  const [start, end] = selectedJalaliDates.value;

  const { gy: dateGY, gm: dateGM, gd: dateGD } = toGregorian(date.year, date.month, date.day);
  const { gy: startGY, gm: startGM, gd: startGD } = toGregorian(start.year, start.month, start.day);
  const { gy: endGY, gm: endGM, gd: endGD } = toGregorian(end.year, end.month, end.day);

  const d = new Date(dateGY, dateGM - 1, dateGD);
  const s = new Date(startGY, startGM - 1, startGD);
  const e = new Date(endGY, endGM - 1, endGD);

  return d >= s && d <= e;
};

watch(showCalender, () => {
  if (showCalender.value) {
    if (!gregorianDateModel.value?.length) {
      // selectDateOfToday()
    } else {
      selectedJalaliDates.value = gregorianDateModel.value.map((d) => {
        const gDate = new Date(d);
        const jDate = toJalaali(gDate);

        return { year: jDate.jy, month: jDate.jm, day: jDate.jd };
      });

      const earliest = selectedJalaliDates.value.reduce((a, b) => {
        if (a.year !== b.year) return a.year < b.year ? a : b;
        if (a.month !== b.month) return a.month < b.month ? a : b;

        return a.day < b.day ? a : b;
      });

      currentMonthAndYear.value = { year: earliest.year, month: earliest.month };
    }
  } else {
    selectedJalaliDates.value = [];
  }
});
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
            :value="truncateSplit(formattedDate, ',', 3)"
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
          <div class="modal-content">
            <!-- Calendar -->
            <div class="calendar-container">
              <!-- Header -->
              <div class="calendar-header">
                <div class="header-date-display truncate-multiple-dates">
                  {{ formattedHeaderDate || "-" }}
                </div>

                <div class="header-month-year">
                  <button class="nav-btn" @click="goToPreviousMonth">
                    <!-- right arrow -->
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
                    {{ persianMonths[currentMonthAndYear.month - 1] }}
                    {{ currentMonthAndYear.year }}
                  </button>

                  <button class="nav-btn" @click="goToNextMonth">
                    <!-- left arrow -->
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

              <!-- Body -->
              <div class="calendar-body">
                <div class="calendar-weekdays">
                  <span v-for="day in persianWeekDays" :key="day">{{ day }}</span>
                </div>

                <div class="calendar-days-container">
                  <transition :name="`slide-${transitionDirection}`" mode="out-in">
                    <div :key="`${currentMonthAndYear.year}-${currentMonthAndYear.month}`" class="calendar-days">
                      <!-- Empty placeholders -->
                      <span
                        v-for="n in getPersianWeekdayIndex(calenderData.dayInfo[0].weekday)"
                        :key="`empty-${n}`"
                        class="empty-day"
                      ></span>

                      <!-- Day buttons -->
                      <button
                        v-for="dayInfo in calenderData.dayInfo"
                        :key="dayInfo.day"
                        class="day-btn"
                        :class="{
                          selected: selectedJalaliDates.some(
                            (d:any) =>
                              d.day === dayInfo.day && d.month === calenderData.month && d.year === calenderData.year
                          ),
                          'in-range': isDateInRange({
                            day: dayInfo.day,
                            month: calenderData.month,
                            year: calenderData.year,
                          }),
                        }"
                        @click="handleDateSelect(dayInfo.day, calenderData.month, calenderData.year)"
                      >
                        {{ dayInfo.day }}
                      </button>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- Footer -->
              <div class="calendar-footer">
                <button class="footer-btn now-btn" @click="selectDateOfToday">اکنون</button>
                <button class="footer-btn confirm-btn" @click="handleSubmit">تایید</button>
              </div>
            </div>
          </div>
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

              <input type="number" class="year-input" v-model.number="currentMonthAndYear.year" />

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

<style scoped>
.truncate-multiple-dates {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

.header-date-display {
  font-size: 24px !important;
}
</style>
