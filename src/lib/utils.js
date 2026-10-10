function formatCurrency(amount) {
  return `\u20B9${amount.toLocaleString("en-IN")}`;
}
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}
export {
  formatCurrency,
  formatDate
};
