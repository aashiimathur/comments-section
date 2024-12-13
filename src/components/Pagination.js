import React from "react";
import { Button, Box } from "@mui/material";

const Pagination = ({ currentPage, onPageChange, total, pageSize }) => {
  const totalPages = total ? Math.ceil(total / pageSize) : 1;

  // Do not render pagination if there’s only one page
  if (totalPages <= 1) return null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        bottom: 16,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "8px",
        backgroundColor: "#fff",
        boxShadow: "0 -1px 4px rgba(0,0,0,0.1)",
        opacity: 0.7,  // Set initial opacity to 0.7
        transition: "opacity 0.3s ease", // Add transition for opacity
        "&:hover": {
          opacity: 1,  // Full opacity when hovered
        },
      }}
    >
      <Button
        variant="contained"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      <Box sx={{ marginX: 2 }}>
        Page {currentPage} of {totalPages}
      </Box>
      <Button
        variant="contained"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </Box>
  );
};

export default Pagination;