export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const calculateDaysRemaining = (dueDate) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};