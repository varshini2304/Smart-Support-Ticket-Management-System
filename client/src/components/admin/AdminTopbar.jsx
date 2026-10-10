/**
 * AdminTopbar Component
 * Reuses the canonical Topbar component configured for Administrator navigation
 */

import React from "react";
import { Topbar } from "../layout/Topbar";

export const AdminTopbar = (props) => {
  return (
    <Topbar
      {...props}
      roleLabel="Administrator"
      profilePath="/admin/profile"
      ticketsPath="/admin/tickets"
      searchPlaceholder="Search tickets by ID, title, customer or status..."
    />
  );
};

export default AdminTopbar;
