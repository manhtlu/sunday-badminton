export default defineAppConfig({
  ui: {
    primary: 'brand',
    gray: 'cool',
    card: {
      background: 'bg-white dark:bg-white',
      ring: 'ring-1 ring-gray-200',
      shadow: 'shadow-sm',
    },
    input: {
      color: {
        white: {
          outline: 'bg-white dark:bg-white text-gray-900 dark:text-gray-900 ring-1 ring-gray-300 dark:ring-gray-300',
        },
      },
    },
    select: {
      color: {
        white: {
          outline: 'bg-white dark:bg-white text-gray-900 dark:text-gray-900 ring-1 ring-gray-300 dark:ring-gray-300',
        },
      },
    },
    textarea: {
      color: {
        white: {
          outline: 'bg-white dark:bg-white text-gray-900 dark:text-gray-900 ring-1 ring-gray-300 dark:ring-gray-300',
        },
      },
    },
    formGroup: {
      label: {
        base: 'text-gray-700 dark:text-gray-700',
      },
    },
    modal: {
      background: 'bg-white dark:bg-white',
    },
  },
})
