import { useState, useEffect } from "react";
import api from "../services/api";

/* Handles the fetch + pagination + loading state that's identical
  across every list page (Categories, Products, Orders, etc.).
 `extraParams` covers page-specific filters like `search` or `status`. */
export function usePaginatedResource(endpoint, extraParams = {}) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  async function fetchItems(page = 1) {
    setLoading(true);
    try {
      const res = await api.get(endpoint, { params: { page, ...extraParams } });
      setItems(res.data.data);
      setPagination(res.data.pagination);
    } finally {
      setLoading(false);
    }
  }

  /* Re-fetch from page 1 whenever the filter params change (e.g.
    the user types a new search term, or picks a different status).
    JSON.stringify lets us compare the params object by VALUE,
    not by reference — without it, a new {} literal on every
    render would look "different" to useEffect every single time,
    causing an infinite fetch loop. */
  useEffect(() => {
    fetchItems(1);
  }, [JSON.stringify(extraParams)]);

  return { items, setItems, pagination, loading, fetchItems };
}