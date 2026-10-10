"use client";
import { useState, useEffect } from "react";
import { getMyRentalsAction } from "../actions/rentalActions";
function useRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchRentals = async () => {
    setLoading(true);
    const res = await getMyRentalsAction();
    if (res.success && res.rentals) {
      setRentals(res.rentals);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchRentals();
  }, []);
  return { rentals, loading, refresh: fetchRentals };
}
export {
  useRentals
};
