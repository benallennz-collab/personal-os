export default function Card({ children, className = '', padding = true, hover = false }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-card transition-shadow duration-200 ${
        hover ? 'hover:shadow-card-hover' : ''
      } ${padding ? 'p-5 sm:p-6' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
