import VCalendar from 'v-calendar'
import 'v-calendar/style.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VCalendar, {
    locales: {
      'vi-VN': {
        firstDayOfWeek: 2,
        masks: { weekdays: 'WWW' },
      },
    },
  })
})
