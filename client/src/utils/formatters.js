/**
 * Formatting utility functions
 * Used across multiple pages for consistent data display
 */

/**
 * Get user initials from full name
 * @param {string} name - Full name
 * @returns {string} Initials (e.g., "John Doe" → "JD")
 */
export const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "Jan 15, 2024")
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format date and time to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted datetime (e.g., "Jan 15, 2024, 10:30 AM")
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Get color for ticket status
 * @param {string} status - Ticket status
 * @returns {string} Hex color code
 */
export const getStatusColor = (status) => {
  const colors = {
    OPEN: "#EF4444",
    IN_PROGRESS: "#F59E0B",
    RESOLVED: "#10B981",
    CLOSED: "#6B7280",
  };
  return colors[status] || "#6B7280";
};

/**
 * Get color for ticket priority
 * @param {string} priority - Ticket priority
 * @returns {string} Hex color code
 */
export const getPriorityColor = (priority) => {
  const colors = {
    HIGH: "#EF4444",
    MEDIUM: "#F59E0B",
    LOW: "#10B981",
  };
  return colors[priority] || "#6B7280";
};

/**
 * Get readable role label
 * @param {string} role - User role
 * @returns {string} Formatted role name
 */
export const getRoleLabel = (role) => {
  return role === "ADMIN" ? "Administrator" : "Customer";
};

/**
 * Format ticket ID for display
 * @param {string} ticketId - MongoDB ticket ID
 * @returns {string} Formatted ID (e.g., "#TK-AB12")
 */
export const formatTicketId = (ticketId) => {
  if (!ticketId) return "#TK-0000";
  return `#TK-${String(ticketId).slice(-4).toUpperCase()}`;
};
