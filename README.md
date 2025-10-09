# vue-jalali-datetime-picker

A powerful, simple, and customizable **Jalali date and time picker** for Vue.js and Nuxt applications. This package provides a flexible **Jalali calendar** component, enabling users to select single dates, date and time, multiple dates, or date ranges with ease. It supports **custom theming**, **slot-based custom inputs**, and is optimized for seamless integration into both modern Vue.js and Nuxt projects.

Enhance your Vue.js or Nuxt application with this **Vue Jalali date picker** for a robust and localized date selection experience, perfect for Persian (Farsi) users or applications requiring **Jalali calendar** support.

[![NPM Package](https://img.shields.io/badge/npm-v1.0.7-blue)](https://www.npmjs.com/package/vue-jalali-datetime-picker)

## Features

- **Single Date Picker**: Select a single date using the Jalali calendar.
- **Date and Time Picker**: Choose both date and time for precise selection.
- **Multiple Date Picker**: Pick multiple dates effortlessly.
- **Date Range Picker**: Select a range of dates for flexible use cases.
- **Customizable Themes**: Customize colors via HSL or specific color values.
- **Custom Input Support**: Use custom input fields via Vue slots.
- **Jalali Calendar Support**: Tailored for Persian users with full Jalali date support.
- **Nuxt Compatibility**: Fully compatible with Nuxt for server-side rendering and static site generation.

## Installation

Getting started is easy! Choose your preferred package manager and run the following command to add **vue-jalali-datetime-picker** to your Vue.js or Nuxt project:

```bash
# Install with npm (great for Node.js projects)
npm i vue-jalali-datetime-picker

# Install with yarn (if you love speed and simplicity)
yarn add vue-jalali-datetime-picker

# Install with pnpm (perfect for efficient dependency management)
pnpm add vue-jalali-datetime-picker
```

### Using a CDN

For quick testing or development without a build step, include the package via a CDN (e.g., unpkg). Add the following script tag to your HTML:

```html
<script src="https://unpkg.com/vue-jalali-datetime-picker@latest/dist/vue-jalali-datetime-picker.umd.js"></script>
```

## Usage

Below are examples demonstrating how to use the **JalaliDateTimePicker** and **JalaliMultipleDatePicker** components in your Vue.js or Nuxt application. Ensure you import the styles for proper rendering.

<div style="text-align: center;">
  <div style="display:flex; gap:10px; justify-content: center;">
    <img src="https://drive.google.com/uc?export=view&id=1SEX8h-CtKcNQogeJtoXE_7bbn5oPYI2I" alt="Persian (Jalali) DateTime Picker" style="height:400px;">
  </div>
</div>

### Importing Styles

- **For Vue Projects**: Import the CSS in your component:

  ```vue
  <script setup lang="ts">
  import "vue-jalali-datetime-picker/style.css";
  </script>
  ```

- **For Nuxt Projects**: Add the CSS to your `nuxt.config.ts`:
  ```typescript
  // nuxt.config.ts
  export default defineNuxtConfig({
    css: ["vue-jalali-datetime-picker/style.css"],
  });
  ```

### Importing the Components

Import the components into your Vue.js or Nuxt component:

```vue
<script setup lang="ts">
import { JalaliDateTimePicker, JalaliMultipleDatePicker } from "vue-jalali-datetime-picker";
</script>
```

### Example 1: Simple Date Picker

Use the **JalaliDateTimePicker** for selecting a single date.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { JalaliDateTimePicker } from "vue-jalali-datetime-picker";

const selectedDate = ref<Date | null>(null);
</script>

<template>
  <JalaliDateTimePicker v-model:date="selectedDate" label="انتخاب تاریخ" />
</template>
```

### Example 2: Date and Time Picker

Enable time selection by adding the `enable-time` prop.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { JalaliDateTimePicker } from "vue-jalali-datetime-picker";

const selectedDateAndTime = ref<Date | null>(null);
</script>

<template>
  <JalaliDateTimePicker v-model:date="selectedDateAndTime" label="انتخاب تاریخ و زمان" enable-time />
</template>
```

### Example 3: Multiple Dates Picker

Use **JalaliMultipleDatePicker** to select multiple dates.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { JalaliMultipleDatePicker } from "vue-jalali-datetime-picker";

const selectedManyDates = ref<Date[]>([]);
</script>

<template>
  <JalaliMultipleDatePicker v-model:dates="selectedManyDates" label="انتخاب چندین تاریخ" type="multiple" />
</template>
```

### Example 4: Ranged Dates Picker

Select a range of dates using the `range` type.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { JalaliMultipleDatePicker } from "vue-jalali-datetime-picker";

const selectedPeriodOfDates = ref<Date[]>([]);
</script>

<template>
  <JalaliMultipleDatePicker v-model:dates="selectedPeriodOfDates" label="انتخاب بازه ای از تاریخ ها" type="range" />
</template>
```

### Customizing Colors

You can customize the calendar's appearance in two ways:

#### Option 1: HSL-Based Theming

Provide HSL values to automatically generate `primaryHover`, `primaryActive`, and `primaryLight` colors.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { JalaliDateTimePicker } from "vue-jalali-datetime-picker";

const selectedDate2 = ref<Date | null>(null);
</script>

<template>
  <JalaliDateTimePicker
    v-model:date="selectedDate2"
    label="تقویم با تم کاستوم"
    :theme="{
      primaryH: '300',
      primaryS: '70%',
      primaryL: '45%',
      textPrimary: 'black',
      textSecondary: 'white',
    }"
  />
</template>
```

#### Option 2: Specific Color Values

Set specific color values for full control.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { JalaliDateTimePicker } from "vue-jalali-datetime-picker";

const selectedDate2 = ref<Date | null>(null);
</script>

<template>
  <JalaliDateTimePicker
    v-model:date="selectedDate2"
    label="تقویم با تم کاستوم"
    :theme="{
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryActive: '#1d4ed8',
      primaryLight: '#93c5fd',
    }"
  />
</template>
```

### Custom Input with Slots

Customize the input field using Vue slots for a tailored user experience.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { JalaliDateTimePicker } from "vue-jalali-datetime-picker";

const selectedDate3 = ref<Date | null>(null);
</script>

<template>
  <JalaliDateTimePicker v-model:date="selectedDate3" label="انتخاب تاریخ با فیلد کاستوم">
    <template #input="{ label, elementId, formattedDate, setShowCalender, clearDate }">
      <div>
        <label
          v-if="label"
          :for="elementId"
          style="
            display: block;
            margin-bottom: 6px;
            font-size: 14px;
            color: #333;
            font-weight: 500;
          "
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
            style="
              background: none;
              border: none;
              color: #888;
              cursor: pointer;
              padding: 2px 4px;
              font-size: 14px;
            "
          >
            ❌
          </button>
        </div>
      </div>
    </template>
  </JalaliDateTimePicker>
</template>
```

## Feedback and Contributions

If you encounter any bugs or have suggestions for improvements, please share them in the [GitHub Issues](https://github.com/RezaTabrizii/vue-jalali-datetime-picker/issues) section of our repository. We welcome your feedback to make this **Vue Jalali date picker** even better!

## Built With

- [Vue.js](https://vuejs.org/) - The Progressive JavaScript Framework
- [jalaali-js](https://github.com/jalaali/jalaali-js) - A library for working with Jalali (Persian) calendar dates

## License

This project is licensed under the MIT License.
