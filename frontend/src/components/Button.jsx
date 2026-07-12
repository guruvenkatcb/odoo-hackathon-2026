export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow',
    secondary: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}