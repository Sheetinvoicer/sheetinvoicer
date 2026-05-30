'use client'

export default function PricingCard({ name, price, period, features, isPopular, ctaText, onSubscribe, isLoading }) {
  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isPopular ? 'ring-2 ring-blue-500 shadow-2xl' : ''}`}>
      {isPopular && (
        <div className="absolute top-0 right-0">
          <div className="bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">MOST POPULAR</div>
        </div>
      )}
      <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">${price}</span>
          <span className="text-gray-500">/{period}</span>
        </div>
      </div>
      <div className="p-6">
        <ul className="space-y-3 mb-6">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={onSubscribe}
          disabled={isLoading}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${isPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        >
          {isLoading ? 'Processing...' : ctaText}
        </button>
      </div>
    </div>
  )
}
