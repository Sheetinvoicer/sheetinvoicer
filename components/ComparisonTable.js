'use client'

export default function ComparisonTable({ plans, features }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left p-4 text-gray-900 dark:text-white font-semibold">Feature</th>
              {plans.map((plan) => (
                <th key={plan.name} className="text-center p-4 text-gray-900 dark:text-white font-semibold">
                  {plan.name}
                  {plan.popular && <span className="block text-xs text-blue-500">Most Popular</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => (
              <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-4 text-gray-900 dark:text-white">{feature.name}</td>
                {plans.map((plan) => {
                  const value = feature.getValue(plan)
                  return (
                    <td key={plan.name} className="text-center p-4">
                      {value === true ? (
                        <svg className="w-5 h-5 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : value === false ? (
                        <svg className="w-5 h-5 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
