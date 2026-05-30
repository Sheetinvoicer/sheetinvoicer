export const dynamic = 'force-dynamic';

export default function SubscriptionSuccess() {
  return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">🎉</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Subscription Successful!
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Thank you for upgrading. Your account has been updated.
      </p>
      <a
        href="/dashboard"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Go to Dashboard
      </a>
    </div>
  )
}