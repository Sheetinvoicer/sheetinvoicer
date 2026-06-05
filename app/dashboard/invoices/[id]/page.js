// Add this section in the Invoice Details area

<div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
  <h2 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Invoice Details</h2>
  <div className="space-y-2">
    <p className="text-gray-900 dark:text-white">
      <span className="font-medium text-gray-600 dark:text-gray-400">Subtotal:</span> 
      <span className="ml-2">${(invoice.subtotal || 0).toFixed(2)}</span>
    </p>
    {invoice.discount_amount > 0 && (
      <p className="text-green-600 dark:text-green-400">
        <span className="font-medium text-gray-600 dark:text-gray-400">Discount ({invoice.discount_code}):</span> 
        <span className="ml-2">-${invoice.discount_amount.toFixed(2)}</span>
      </p>
    )}
    <p className="text-gray-900 dark:text-white font-semibold pt-1 border-t border-gray-200">
      <span className="font-medium">Total:</span> 
      <span className="ml-2">${(invoice.total || 0).toFixed(2)}</span>
    </p>
  </div>
</div>
